import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';


const SESSION_COOKIE = "sr_session";

const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    ...sessionCookieOptions(),
    maxAge: SESSION_MAX_AGE,
  });
}

export const logoutCustomer = (req, res) => {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;
const isDevOtp = process.env.NODE_ENV !== 'production' && process.env.OTP_MODE === 'development';
function phoneOf(value) {
  if (typeof value !== 'string') return null;
  const phone = value.replace(/[\s()-]/g, '').replace(/^\+91/, '');
  return /^[6-9]\d{9}$/.test(phone) ? phone : null;
}
function hashOtp(phone, purpose, challengeId, otp) {
  if (!process.env.OTP_HASH_SECRET) throw new Error('OTP_HASH_SECRET is missing');
  return crypto.createHmac('sha256', process.env.OTP_HASH_SECRET)
    .update(`${phone}:${purpose}:${challengeId}:${otp}`).digest('hex');
}
function signCustomer(customer) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
  return jwt.sign({ customer_id: customer.customer_id, customer_phone: customer.customer_phone },
    process.env.JWT_SECRET, { expiresIn: '1d' });
}
function safeCustomer(customer) {
  return {
    customer_id: customer.customer_id,
    customer_fullname: customer.customer_fullname,
    customer_phone: customer.customer_phone,
    customer_phone_verified: Boolean(customer.customer_phone_verified),
    customer_shippingaddress: customer.customer_shippingaddress,
    customer_profileurl: customer.customer_profileurl
  };
}
function fail(res, status, message) { return res.status(status).json({ success: false, message }); }
function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
}
export const sendOTP = async (req, res) => {
  const phone = phoneOf(req.body?.customer_phone);
  const name = req.body?.customer_fullname;
  if (!phone) {
    return fail(res, 400, "Enter a valid 10-digit Indian mobile number");
  }
  if (!isDevOtp) {
    return fail(res, 503, "SMS OTP provider is not configured");
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Check if customer already exists
    const [customers] = await conn.query(
      `SELECT customer_id
       FROM customers
       WHERE customer_phone = ?
       LIMIT 1`,
      [phone]
    );
    const isExistingCustomer = customers.length > 0;
    const purpose = isExistingCustomer ? "login" : "signup";
    // Name is required only for new customers
    if (!isExistingCustomer && !validateName(name)) {
      await conn.rollback();
      return fail(
        res,
        400,
        "Full name is required for new customers (2-100 characters)"
      );
    }
    // Reuse existing OTP table and its unique phone/purpose key
    await conn.query(
      `INSERT INTO customer_otps (
          customer_phone,
          otp_purpose,
          otp_hash,
          challenge_id,
          otp_expires_at,
          window_started_at
       )
       VALUES (?, ?, '', '', NOW(), NOW())
       ON DUPLICATE KEY UPDATE
          otp_id = LAST_INSERT_ID(otp_id)`,
      [phone, purpose]
    );
    const [[record]] = await conn.query(
      `SELECT *
       FROM customer_otps
       WHERE customer_phone = ?
         AND otp_purpose = ?
       FOR UPDATE`,
      [phone, purpose]
    );
    const now = Date.now();
    const sentAt = record.last_sent_at
      ? new Date(record.last_sent_at).getTime()
      : 0;
    if (sentAt && now - sentAt < RESEND_MS) {
      await conn.rollback();
      return fail(
        res,
        429,
        "Please wait 60 seconds before requesting another OTP"
      );
    }
    const windowStart = new Date(
      record.window_started_at
    ).getTime();
    const newWindow =
      now - windowStart >= 60 * 60 * 1000;
    const count = newWindow ? 0 : record.send_count;
    if (count >= MAX_SENDS_PER_HOUR) {
      await conn.rollback();
      return fail(
        res,
        429,
        "Too many OTP requests. Try again later"
      );
    }
    // Generate OTP
    const otp = String(
      crypto.randomInt(0, 1000000)
    ).padStart(6, "0");
    const challengeId = crypto
      .randomBytes(24)
      .toString("hex");
    const otpHash = hashOtp(
      phone,
      purpose,
      challengeId,
      otp
    );
    await conn.query(
      `UPDATE customer_otps
       SET
         challenge_id = ?,
         otp_hash = ?,
         customer_fullname = ?,
         otp_expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE),
         otp_attempts = 0,
         consumed = 0,
         last_sent_at = NOW(),
         window_started_at = ?,
         send_count = ?
       WHERE otp_id = ?`,
      [
        challengeId,
        otpHash,
        isExistingCustomer ? null : name.trim(),
        newWindow ? new Date(now) : record.window_started_at,
        count + 1,
        record.otp_id
      ]
    );
    await conn.commit();
    // Development only: replace with SMS provider later
    console.log(`[DEV OTP] ${phone}: ${otp}`);
    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      challenge_id: challengeId,
      expires_in: 300,
      resend_after: 60
    });
  } catch (error) {
    await conn.rollback();
    console.error("Send OTP Error:", error);
    return fail(res, 500, "Unable to generate OTP");
  } finally {
    conn.release();
  }
};
export const verifyOTP = async (req, res) => {
  const phone = phoneOf(req.body?.customer_phone);
  const { otp, challenge_id: challengeId } = req.body || {};
  if (
    !phone ||
    typeof otp !== "string" ||
    !/^\d{6}$/.test(otp) ||
    typeof challengeId !== "string" ||
    !/^[a-f0-9]{48}$/.test(challengeId)
  ) {
    return fail(
      res,
      400,
      "Valid phone, OTP and challenge_id are required"
    );
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // 1. Find and lock the OTP request
    const [[record]] = await conn.query(
      `SELECT *
       FROM customer_otps
       WHERE customer_phone = ?
         AND challenge_id = ?
       FOR UPDATE`,
      [phone, challengeId]
    );
    if (
      !record ||
      record.consumed ||
      new Date(record.otp_expires_at).getTime() <= Date.now()
    ) {
      await conn.rollback();
      return fail(
        res,
        400,
        "OTP expired or invalid. Request a new OTP"
      );
    }
    if (record.otp_attempts >= MAX_ATTEMPTS) {
      await conn.rollback();
      return fail(res, 429, "Maximum OTP attempts exceeded");
    }
    // 2. Verify OTP using the purpose saved at send time
    const expected = hashOtp(
      phone,
      record.otp_purpose,
      challengeId,
      otp
    );
    const storedHash = Buffer.from(record.otp_hash, "hex");
    const expectedHash = Buffer.from(expected, "hex");
    const isValid =
      storedHash.length === expectedHash.length &&
      crypto.timingSafeEqual(storedHash, expectedHash);
    if (!isValid) {
      await conn.query(
        `UPDATE customer_otps
         SET otp_attempts = otp_attempts + 1
         WHERE otp_id = ?`,
        [record.otp_id]
      );
      await conn.commit();
      return fail(res, 400, "Incorrect OTP");
    }
    // 3. Check whether the customer exists
    let [[customer]] = await conn.query(
      `SELECT
          customer_id,
          customer_fullname,
          customer_phone,
          customer_phone_verified,
          customer_shippingaddress,
          customer_profileurl
       FROM customers
       WHERE customer_phone = ?
       LIMIT 1`,
      [phone]
    );
    let isNewCustomer = false;
    // 4. Register a new customer when necessary
    if (!customer) {
      if (
        record.otp_purpose !== "signup" ||
        !validateName(record.customer_fullname)
      ) {
        await conn.rollback();
        return fail(
          res,
          400,
          "Signup details missing. Request a new OTP"
        );
      }
      // Generate the next ID safely using the sequence table
      const [sequenceResult] = await conn.query(
        `UPDATE customer_id_sequence
         SET last_customer_id =
           LAST_INSERT_ID(last_customer_id + 1)
         WHERE id = 1`
      );
      if (sequenceResult.affectedRows !== 1) {
        throw new Error("Customer ID sequence is not initialized");
      }
      const [[idRow]] = await conn.query(
        `SELECT LAST_INSERT_ID() AS customerId`
      );
      const customerId = idRow.customerId;
      await conn.query(
        `INSERT INTO customers (
            customer_id,
            customer_fullname,
            customer_phone,
            customer_phone_verified
         )
         VALUES (?, ?, ?, 1)`,
        [
          customerId,
          record.customer_fullname.trim(),
          phone
        ]
      );
      isNewCustomer = true;
      // Retrieve newly registered customer
      [[customer]] = await conn.query(
        `SELECT
            customer_id,
            customer_fullname,
            customer_phone,
            customer_phone_verified,
            customer_shippingaddress,
            customer_profileurl
         FROM customers
         WHERE customer_id = ?`,
        [customerId]
      );
    } else {
      // Existing customer: mark phone verified
      if (!customer.customer_phone_verified) {
        await conn.query(
          `UPDATE customers
           SET customer_phone_verified = 1
           WHERE customer_id = ?`,
          [customer.customer_id]
        );
        customer.customer_phone_verified = 1;
      }
    }
    // 5. Generate JWT
    const token = signCustomer(customer);
    // 6. Consume OTP so it cannot be reused
    await conn.query(
      `UPDATE customer_otps
       SET consumed = 1,
           otp_hash = ''
       WHERE otp_id = ?`,
      [record.otp_id]
    );
    // Invalidate any other outstanding OTP for this phone
    await conn.query(
      `UPDATE customer_otps
       SET consumed = 1,
           otp_hash = ''
       WHERE customer_phone = ?
         AND otp_id <> ?`,
      [phone, record.otp_id]
    );

    await conn.commit();

    // Store the JWT in an HttpOnly cookie.
    setSessionCookie(res, token);

    return res.status(200).json({
      success: true,
      message: isNewCustomer
        ? "Registration successful"
        : "Login successful",
      is_new_customer: isNewCustomer,
      customer: safeCustomer(customer),
    });

  } catch (error) {
    await conn.rollback();
    console.error("Verify OTP Error:", error);
    return fail(res, 500, "Unable to verify OTP");
  } finally {
    conn.release();
  }
};

// Status and cancellation use the opaque challenge ID, not a public phone-number lookup.
export const getOtpStatus = async (req, res) => {
  const id = req.query?.challenge_id;
  if (typeof id !== 'string' || !/^[a-f0-9]{48}$/.test(id)) return fail(res, 400, 'Valid challenge_id required');
  const [[row]] = await pool.query('SELECT otp_expires_at, consumed, otp_attempts FROM customer_otps WHERE challenge_id=? LIMIT 1', [id]);
  if (!row) return fail(res, 404, 'OTP request not found');
  return res.json({
    success: true, status: row.consumed ? 'used' : row.otp_attempts >= MAX_ATTEMPTS ? 'locked' :
      new Date(row.otp_expires_at).getTime() <= Date.now() ? 'expired' : 'pending'
  });
};
export const cancelOtp = async (req, res) => {
  const id = req.body?.challenge_id;
  if (typeof id !== 'string' || !/^[a-f0-9]{48}$/.test(id)) return fail(res, 400, 'Valid challenge_id required');
  await pool.query('UPDATE customer_otps SET consumed=1, otp_hash=\'\' WHERE challenge_id=?', [id]);
  return res.json({ success: true, message: 'OTP request cancelled if it existed' });
};
export const getCustomerProfile = async (req, res) => {
  try {
    const [[customer]] = await pool.query(`SELECT customer_id, customer_fullname, customer_phone,
      customer_phone_verified, customer_shippingaddress, customer_profileurl, customer_createdat
      FROM customers WHERE customer_id=?`, [req.customer.customer_id]);
    if (!customer) return fail(res, 404, 'Customer not found');
    return res.json({ success: true, customer });
  } catch (error) { console.error('Get profile:', error); return fail(res, 500, 'Failed to fetch profile'); }
};
export const updateCustomerProfile = async (req, res) => {
  try {
    const { customer_fullname, customer_shippingaddress, customer_profileurl } = req.body || {};
    if (!validateName(customer_fullname)) return fail(res, 400, 'Full name must be 2–100 characters');
    if (customer_shippingaddress != null && (typeof customer_shippingaddress !== 'object' || Array.isArray(customer_shippingaddress))) {
      return fail(res, 400, 'Shipping address must be a JSON object');
    }
    // Phone cannot be changed without verifying the NEW phone number.
    if (req.body?.customer_phone !== undefined) return fail(res, 400, 'Phone changes require separate OTP verification');
    await pool.query(`UPDATE customers SET customer_fullname=?, customer_shippingaddress=?, customer_profileurl=?
      WHERE customer_id=?`, [customer_fullname.trim(), customer_shippingaddress == null ? null : JSON.stringify(customer_shippingaddress),
    typeof customer_profileurl === 'string' ? customer_profileurl : null, req.customer.customer_id]);
    return getCustomerProfile(req, res);
  } catch (error) { console.error('Update profile:', error); return fail(res, 500, 'Failed to update profile'); }
};
export const updateCheckoutAddress = async (req, res) => {
  try {
    const customerId = req.customer.customer_id;
    const address = req.body?.shipping_address;

    if (!address || typeof address !== "object" || Array.isArray(address)) {
      return res.status(400).json({
        success: false,
        message: "A valid shipping address is required",
      });
    }

    const requiredFields = [
      "full_name",
      "phone",
      "address_line1",
      "city",
      "state",
      "pincode",
      "country",
    ];

    for (const field of requiredFields) {
      if (
        typeof address[field] !== "string" ||
        !address[field].trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    if (!/^[0-9]{6}$/.test(address.pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit pincode",
      });
    }

    const cleanAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    const [result] = await pool.query(
      `UPDATE customers
       SET customer_shippingaddress = ?
       WHERE customer_id = ?`,
      [JSON.stringify(cleanAddress), customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      message: "Shipping address updated successfully",
      shipping_address: cleanAddress,
    });
  } catch (error) {
    console.error("Update checkout address:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shipping address",
    });
  }
};