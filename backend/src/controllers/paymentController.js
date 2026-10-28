import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import pool from '../config/db.js';

const gateway = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay credentials are missing');
  return new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
};
const parseJSON = (v) => { if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch { return null; } };
const fail = (message, code=400) => Object.assign(new Error(message), {statusCode:code});
const money = (v) => Math.round(Number(v)*100);
const safeCompare = (a,b) => { if (!/^[a-f0-9]{64}$/i.test(String(a||''))) return false; return crypto.timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex')); };
const id = () => `ORD${Date.now()}${crypto.randomInt(1000,9999)}`;

// All prices are read from the catalogue, never from cart.unit_price or the browser.
async function snapshotCart(conn, customerId) {
  const [cart] = await conn.query('SELECT * FROM cart WHERE customer_id=? ORDER BY cart_item_id FOR UPDATE',[customerId]);
  if (!cart.length) throw fail('Cart is empty');
  const items=[];
  for (const c of cart) {
    const quantity=Number(c.quantity);
    if (!Number.isSafeInteger(quantity) || quantity<1) throw fail('Invalid cart quantity');
    let record, price, name, itemId, shiprocketRequired;
    if (c.item_type==='product') {
      const [rows]=await conn.query('SELECT product_id,product_name,product_selling_price,product_stock FROM products WHERE product_id=? FOR UPDATE',[c.product_id]);
      record=rows[0]; if(!record) throw fail(`Product ${c.product_id} is unavailable`);
      if (Number(record.product_stock)<quantity) throw fail(`${record.product_name}: insufficient stock`);
      price=record.product_selling_price; name=record.product_name; itemId=record.product_id; shiprocketRequired=true;
    } else if (c.item_type==='service') {
      const [rows]=await conn.query('SELECT service_id,service_title,service_selling_price FROM services WHERE service_id=?',[c.service_id]);
      record=rows[0]; if(!record) throw fail(`Service ${c.service_id} is unavailable`);
      price=record.service_selling_price; name=record.service_title; itemId=record.service_id; shiprocketRequired=false;
    } else if (c.item_type==='offer') {
      const [rows]=await conn.query('SELECT offer_id,offer_title,offer_price,offer_stock,offer_status,start_date,end_date,offer_items FROM offers WHERE offer_id=? FOR UPDATE',[c.offer_id]);
      record=rows[0]; if(!record || !record.offer_status || Date.now()<new Date(record.start_date).getTime() || Date.now()>new Date(record.end_date).getTime()) throw fail(`Offer ${c.offer_id} is unavailable`);
      if(Number(record.offer_stock)<quantity) throw fail(`${record.offer_title}: insufficient stock`);
      price=record.offer_price; name=record.offer_title; itemId=record.offer_id; shiprocketRequired=true;
    } else throw fail('Invalid cart item type');
    const paise=money(price);
    if(!Number.isSafeInteger(paise) || paise<1) throw fail(`Invalid price for ${name}`);
    items.push({cart_item_id:c.cart_item_id,item_type:c.item_type,item_id:itemId,name,quantity,unit_price:paise/100,total:(paise*quantity)/100,selected_offer_items:c.item_type==='offer'?(parseJSON(c.selected_offer_items)??parseJSON(record.offer_items)):null,shiprocket_required:shiprocketRequired});
  }
  return items;
}
function normalizedAddress(customer, supplied) {
  const existing=parseJSON(customer.customer_shippingaddress)||{};
  const addr=supplied && typeof supplied==='object' && !Array.isArray(supplied)?supplied:existing;
  const result={full_name:String(addr.full_name||addr.fullName||customer.customer_fullname||'').trim(),phone:String(addr.phone||customer.customer_phone||'').trim(),address_line1:String(addr.address_line1||addr.addressLine1||'').trim(),address_line2:String(addr.address_line2||addr.addressLine2||'').trim(),city:String(addr.city||'').trim(),state:String(addr.state||'').trim(),pincode:String(addr.pincode||'').trim(),country:String(addr.country||'India').trim()};
  if(!result.full_name || !/^[6-9]\d{9}$/.test(result.phone) || !result.address_line1 || !result.city || !result.state || !/^\d{6}$/.test(result.pincode)) throw fail('Enter a valid shipping address');
  return result;
}

export async function createPaymentOrder(req,res) {
  let conn;
  try {
    const customerId=req.customer.customer_id;
    conn=await pool.getConnection(); await conn.beginTransaction();
    const [rows]=await conn.query('SELECT customer_fullname,customer_phone,customer_shippingaddress FROM customers WHERE customer_id=?',[customerId]);
    if(!rows.length) throw fail('Customer not found',404);
    const address=normalizedAddress(rows[0],req.body?.shipping_address);
    const items=await snapshotCart(conn,customerId);
    const paise=items.reduce((sum,x)=>sum+money(x.unit_price)*x.quantity,0);
    if(!Number.isSafeInteger(paise)||paise<100) throw fail('Order amount must be at least INR 1');
    const orderId=id();
    await conn.query(`INSERT INTO orders (order_id,customer_id,order_status,shipping_address,payment_mode,payment_type,payment_status,order_items,subtotal,discount,shipping_charge,total_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,[orderId,customerId,'Pending',JSON.stringify(address),'Online','Razorpay','Pending',JSON.stringify(items),paise/100,0,0,paise/100]);
    // A pending gateway request is tracked even if the remote API fails.
    const [insert]=await conn.query('INSERT INTO order_payments (order_id,amount,currency,payment_status) VALUES (?,?,?,?)',[orderId,paise/100,'INR','Initializing']);
    await conn.commit(); conn.release(); conn=null;
    const rpOrder=await gateway().orders.create({amount:paise,currency:'INR',receipt:orderId,notes:{order_id:orderId},partial_payment:false});
    await pool.query('UPDATE order_payments SET gateway_order_id=?,payment_status=? WHERE payment_id=? AND payment_status=?',[rpOrder.id,'Created',insert.insertId,'Initializing']);
    res.status(201).json({success:true,order_id:orderId,razorpay_order_id:rpOrder.id,key_id:process.env.RAZORPAY_KEY_ID,amount:paise,currency:'INR'});
  } catch(e) {
    if(conn){await conn.rollback().catch(()=>{});conn.release();}
    console.error('Create payment order:',e);
    res.status(e.statusCode||502).json({success:false,message:e.statusCode?e.message:'Unable to initialize payment. Please try again.'});
  }
}

// Finalization is idempotent and atomic; inventory is checked again at capture time.
async function finalizePayment(gatewayOrderId,payment) {
  const conn=await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows]=await conn.query(`SELECT p.payment_id,p.order_id,p.amount,p.currency,p.payment_status,o.order_items,o.customer_id,o.payment_status AS order_payment_status FROM order_payments p JOIN orders o ON o.order_id=p.order_id WHERE p.gateway_order_id=? FOR UPDATE`,[gatewayOrderId]);
    if(!rows.length) throw fail('Unknown payment order',404);
    const row=rows[0];
    if(payment.order_id!==gatewayOrderId || payment.status!=='captured' || Number(payment.amount)!==money(row.amount) || payment.currency!==row.currency) throw fail('Payment not captured or amount mismatch');
    if(row.payment_status==='Paid' && row.order_payment_status==='Paid') {await conn.commit();return {order_id:row.order_id,status:'Paid'};}
    if(row.payment_status==='RefundRequired') {await conn.commit();return {order_id:row.order_id,status:'RefundRequired'};}
    const items=parseJSON(row.order_items);
    if(!Array.isArray(items)||!items.length) throw fail('Invalid order items');
    // Conditional updates avoid negative stock under concurrent payments.
    let stockError=false;
    for(const item of items) {
      if(item.item_type==='product') {
        const [result]=await conn.query('UPDATE products SET product_stock=product_stock-? WHERE product_id=? AND product_stock>=?',[item.quantity,item.item_id,item.quantity]);
        if(!result.affectedRows){stockError=true;break;}
      } else if(item.item_type==='offer') {
        const [result]=await conn.query('UPDATE offers SET offer_stock=offer_stock-? WHERE offer_id=? AND offer_stock>=?',[item.quantity,item.item_id,item.quantity]);
        if(!result.affectedRows){stockError=true;break;}
      }
    }
    if(stockError) {
      await conn.rollback();
      // Separate transaction: preserve the captured payment for manual refund/reconciliation.
      await conn.beginTransaction();
      const [check]=await conn.query('SELECT payment_status FROM order_payments WHERE payment_id=? FOR UPDATE',[row.payment_id]);
      if(check[0]?.payment_status!=='Paid') {
        await conn.query('UPDATE order_payments SET payment_status=?,gateway_payment_id=?,payment_method=? WHERE payment_id=?',['RefundRequired',payment.id,payment.method||null,row.payment_id]);
        await conn.query('UPDATE orders SET payment_status=?,order_status=? WHERE order_id=?',['RefundRequired','Pending',row.order_id]);
      }
      await conn.commit();
      return {order_id:row.order_id,status:'RefundRequired'};
    }
    await conn.query('UPDATE order_payments SET payment_status=?,gateway_payment_id=?,payment_method=? WHERE payment_id=?',['Paid',payment.id,payment.method||null,row.payment_id]);
    await conn.query('UPDATE orders SET payment_status=?,payment_type=?,order_status=? WHERE order_id=?',['Paid',payment.method||'Razorpay','Confirmed',row.order_id]);
    // Only remove the purchased quantities; preserve additions made while paying.
    for(const item of items) {
      const column={product:'product_id',service:'service_id',offer:'offer_id'}[item.item_type];
      if(!column) continue;
      const [cartRows]=await conn.query(`SELECT cart_item_id,quantity FROM cart WHERE customer_id=? AND item_type=? AND ${column}=? FOR UPDATE`,[row.customer_id,item.item_type,item.item_id]);
      for(const c of cartRows) {
        if(c.quantity<=item.quantity) await conn.query('DELETE FROM cart WHERE cart_item_id=?',[c.cart_item_id]);
        else await conn.query('UPDATE cart SET quantity=quantity-? WHERE cart_item_id=?',[item.quantity,c.cart_item_id]);
      }
    }
    await conn.commit();return {order_id:row.order_id,status:'Paid'};
  } catch(e) {await conn.rollback().catch(()=>{});throw e;} finally {conn.release();}
}

export async function verifyPayment(req,res) {
  try {
    const {order_id,razorpay_payment_id,razorpay_signature}=req.body||{};
    if(!order_id||!razorpay_payment_id||!razorpay_signature) throw fail('Missing payment verification fields');
    const [rows]=await pool.query(`SELECT p.gateway_order_id FROM order_payments p JOIN orders o ON o.order_id=p.order_id WHERE p.order_id=? AND o.customer_id=? AND p.gateway_order_id IS NOT NULL`,[order_id,req.customer.customer_id]);
    if(!rows.length) throw fail('Order not found',404);
    const gatewayOrderId=rows[0].gateway_order_id;
    const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${gatewayOrderId}|${razorpay_payment_id}`).digest('hex');
    if(!safeCompare(expected,razorpay_signature)) throw fail('Invalid payment signature',403);
    const payment=await gateway().payments.fetch(razorpay_payment_id);
    if(payment.order_id!==gatewayOrderId) throw fail('Payment does not belong to this order',403);
    if(payment.status!=='captured') return res.status(202).json({success:false,status:payment.status,message:'Payment is not captured yet'});
    const result=await finalizePayment(gatewayOrderId,payment);
    res.status(result.status==='Paid'?200:409).json({success:result.status==='Paid',...result,message:result.status==='Paid'?'Payment confirmed':'Payment captured, but inventory unavailable. Contact support for a refund.'});
  } catch(e){console.error('Verify payment:',e);res.status(e.statusCode||500).json({success:false,message:e.statusCode?e.message:'Unable to verify payment'});}
}

export async function paymentWebhook(req,res) {
  try {
    if(!process.env.RAZORPAY_WEBHOOK_SECRET) throw new Error('Webhook secret missing');
    const received=req.get('x-razorpay-signature');
    const expected=crypto.createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest('hex');
    if(!safeCompare(expected,received)) return res.sendStatus(401);
    const event=JSON.parse(req.body.toString('utf8'));
    if(event.event==='payment.captured') {
      const payload=event.payload?.payment?.entity;
      if(!payload?.order_id||!payload?.id) throw fail('Invalid webhook payment');
      // Fetch authoritative gateway state, rather than trusting only the event body.
      const payment=await gateway().payments.fetch(payload.id);
      await finalizePayment(payload.order_id,payment);
    }
    res.status(200).json({success:true});
  } catch(e){
    if(e.statusCode===404) return res.status(200).json({success:true,ignored:true});
    console.error('Razorpay webhook:',e);res.sendStatus(500); // Gateway retries transient failures.
  }
}

export async function getPaymentStatus(req,res) {
  try {
    const [rows]=await pool.query(`SELECT o.order_id,o.order_status,o.payment_status,p.gateway_order_id,p.payment_status AS gateway_status FROM orders o LEFT JOIN order_payments p ON p.order_id=o.order_id WHERE o.order_id=? AND o.customer_id=? ORDER BY p.payment_id DESC LIMIT 1`,[req.params.orderId,req.customer.customer_id]);
    if(!rows.length) return res.status(404).json({success:false,message:'Order not found'});
    res.json({success:true,...rows[0]});
  } catch(e){console.error(e);res.status(500).json({success:false,message:'Unable to get payment status'});}
}
