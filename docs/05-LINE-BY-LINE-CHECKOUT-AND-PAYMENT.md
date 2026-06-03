# Line-by-Line: Checkout.jsx + paymentController.js

Use this when the reviewer says **"walk me through payment"** or **"explain checkout code"**.

---

## Checkout.jsx — full walkthrough

**File:** `frontend/src/features/cart/pages/Checkout.jsx`  
**Route:** `/checkout` (wrapped in `ProtectedRoute` — must be logged in)

### Imports (lines 1–14)

| Import | Why |
|--------|-----|
| `useEffect, useState` | Payment config on mount; form state |
| `useNavigate, Link` | Redirect empty cart; back to cart |
| `toast` | User feedback on success/error |
| `useCart` | items, total, clearCart |
| `useAuth` | user name/email for Razorpay prefill |
| `orderAPI, paymentAPI` | HTTP calls |
| `formatPrice` | Display ₹ amounts |
| `loadRazorpayScript, openRazorpayCheckout` | Razorpay browser integration |

### State (lines 20–23)

```js
deliveryAddress  // string from textarea
loading          // disables submit during API calls
paymentEnabled   // from GET /payments/config
testMode         // show test card hint in UI
```

### useEffect — payment config (lines 26–37)

On mount:

1. `paymentAPI.getConfig()`
2. Sets `paymentEnabled` and `testMode` from `res.data.data`
3. On failure → both false → UI shows COD messaging

**This decides COD vs Razorpay for the whole page** — not a user toggle.

### Empty cart guard (lines 40–43)

If `items.length === 0` → `navigate('/cart')` and return `null`.

Prevents placing order without cart (e.g. direct URL `/checkout`).

### orderItems mapping (lines 46–49)

Transforms Redux cart (full pizza objects) → API shape:

```js
{ pizza: pizza._id, qty }
```

**Critical:** Only IDs go to server — prices stripped intentionally.

### placeCodOrder (lines 52–60)

1. `orderAPI.place({ items: orderItems, deliveryAddress: trim })`
2. `clearCart()` — Redux + localStorage
3. `toast.success`
4. `navigate('/orders')`

Single backend call. Order status Pending, unpaid.

### placeRazorpayOrder (lines 63–93)

| Step | Code | Library |
|------|------|---------|
| 1 | `loadRazorpayScript()` | Dynamic script tag |
| 2 | Fail if script didn't load | toast error, return |
| 3 | `paymentAPI.createOrder({ items })` | Axios → Express → Razorpay SDK |
| 4 | Destructure `razorpayOrderId, amount, currency, keyId` | From response |
| 5 | `openRazorpayCheckout({...})` | window.Razorpay modal |
| 6 | `paymentAPI.verify({ items, address, razorpay_* })` | Axios → crypto verify → Order.create |
| 7 | clearCart, toast, navigate | Same as COD |

`onSuccess: (response) => response` inside openRazorpayCheckout — passes Razorpay handler payload through Promise resolve.

### handlePlaceOrder (lines 96–124)

1. `e.preventDefault()`
2. Validate address non-empty after trim
3. `setLoading(true)`
4. try: `paymentEnabled ? placeRazorpayOrder() : placeCodOrder()`
5. catch:
   - If `err.message === 'Payment cancelled'` → silent (user closed modal)
   - Else show API `message` or first `errors[0].message` or generic
6. `finally: setLoading(false)`

### JSX structure (lines 126–197)

- **Left column:** form with textarea, payment info box, submit button text changes:
  - loading → "Processing..."
  - Razorpay → `Pay ₹X (Test)`
  - COD → "Place Order"
- **Right column:** order summary — maps cart lines with `formatPrice`

---

## paymentController.js — full walkthrough

**File:** `backend/controllers/paymentController.js`

### getRazorpayInstance (lines 13–28)

- Reads `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Missing keys → return `null` (503 later)
- Key must start with `rzp_test_` else throw 500
- Returns `new Razorpay({ key_id, key_secret })`

### isTestMode / getPaymentConfig (lines 30–49)

Public endpoint for frontend. Never sends `keySecret` to client — only `keyId` when enabled.

### createPaymentOrder (lines 52–125)

1. Try get Razorpay instance — catch config errors
2. 503 if no instance
3. `validateAndBuildOrderItems(req.body.items)` — same as orders
4. `amountInPaise = Math.round(totalAmount * 100)`
5. Min 100 paise check
6. `receiptId = 'pp' + Date.now()` — short receipt for Razorpay limit
7. `razorpay.orders.create({ amount, currency: INR, receipt, notes })`
8. Return ids and amounts to frontend

**No Order document** created here — only Razorpay-side order.

### verifyPayment (lines 128–205)

1. Require `RAZORPAY_KEY_SECRET`
2. Extract body fields
3. Build HMAC signature string: `order_id|payment_id`
4. Compare to `razorpay_signature` — mismatch → 400
5. `Order.findOne({ razorpayOrderId })` — if exists return 200 with existing (idempotent)
6. `validateAndBuildOrderItems` again — re-validate cart at payment time
7. `Order.create` with paid + Confirmed + razorpay ids
8. Populate and 201

**Why validate items twice?** Cart could change between create-order and verify; prices/availability must be current.

---

## Sequence diagram (Razorpay)

```
Customer          Checkout.jsx       api.js          paymentController    Razorpay
   |                    |               |                    |              |
   |-- open checkout -->|               |                    |              |
   |                    |-- GET config->|                    |              |
   |                    |<- enabled ----|                    |              |
   |-- submit --------->|               |                    |              |
   |                    |-- POST create>|------------------->|------------->|
   |                    |<- orderId ----|<-------------------|<-------------|
   |                    |-- open popup -------------------------------------->|
   |<- pay in modal ----------------------------------------------------------------|
   |                    |<- signature --|                    |              |
   |                    |-- POST verify>|------------------->| crypto OK    |
   |                    |               |                    | Order.create |
   |                    |<- order -------|                    |              |
   |<- redirect /orders |               |                    |              |
```

---

## Code — full Checkout.jsx (annotated)

> Added: main functions from the real file. Nothing above was removed.

```jsx
const Checkout = () => {
  const { items, total, clearCart } = useCart();   // Redux cart
  const { user } = useAuth();                      // for Razorpay prefill

  useEffect(() => {
    paymentAPI.getConfig().then((res) => {
      setPaymentEnabled(res.data.data.enabled);    // COD vs Razorpay
      setTestMode(res.data.data.testMode);
    });
  }, []);

  if (items.length === 0) { navigate('/cart'); return null; }

  const orderItems = items.map(({ pizza, qty }) => ({
    pizza: pizza._id,   // only ID sent to server
    qty,
  }));

  const placeCodOrder = async () => {
    await orderAPI.place({ items: orderItems, deliveryAddress: deliveryAddress.trim() });
    clearCart();
    navigate('/orders');
  };

  const placeRazorpayOrder = async () => {
    await loadRazorpayScript();
    const { razorpayOrderId, amount, currency, keyId } =
      (await paymentAPI.createOrder({ items: orderItems })).data.data;
    const paymentResponse = await openRazorpayCheckout({ keyId, amount, currency, orderId: razorpayOrderId, user });
    await paymentAPI.verify({
      items: orderItems,
      deliveryAddress: deliveryAddress.trim(),
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
    });
    clearCart();
    navigate('/orders');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      paymentEnabled ? await placeRazorpayOrder() : await placeCodOrder();
    } catch (err) {
      if (err.message !== 'Payment cancelled') toast.error(...);
    } finally { setLoading(false); }
  };
};
```

## Code — paymentController.js (key parts)

```js
const createPaymentOrder = async (req, res) => {
  const { orderItems, totalAmount } = await validateAndBuildOrderItems(req.body.items);
  const amountInPaise = Math.round(totalAmount * 100);
  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: 'pp' + Date.now(),
  });
  res.json({ success: true, data: { razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, keyId } });
};

const verifyPayment = async (req, res) => {
  const expected = crypto.createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });

  const existing = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (existing) return res.status(200).json({ success: true, data: existing });

  const { orderItems, totalAmount } = await validateAndBuildOrderItems(items);
  const order = await Order.create({
    customerId: req.user._id, items: orderItems, totalAmount, deliveryAddress,
    status: 'Confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay',
    razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id,
  });
  res.status(201).json({ success: true, data: order });
};
```

---

[← INDEX](./INDEX.md)
