-- Customers Table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  customer_type TEXT DEFAULT 'retail', -- 'retail' or 'wholesale'
  credit_limit NUMERIC DEFAULT 0,
  current_outstanding NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ledger Table
CREATE TABLE ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  type TEXT NOT NULL, -- 'receivable' or 'payable'
  amount NUMERIC NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'paid'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotations Table
CREATE TABLE quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  gst NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  valid_until DATE,
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Reminders Table
CREATE TABLE payment_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  amount_due NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'paid', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update Products Table
ALTER TABLE products 
ADD COLUMN wholesale_discount NUMERIC DEFAULT 10,
ADD COLUMN min_wholesale_qty INTEGER DEFAULT 10;
