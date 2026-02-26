-- ==========================================
-- STB FF GUILD - ADMIN SETUP & DATABASE INIT
-- ==========================================

-- ধাপ ১: প্রথমে আপনার ডাটাবেস সেটআপ করুন
-- 'src/lib/complete_schema.sql' ফাইলের পুরো কোড কপি করে Supabase SQL Editor-এ রান করুন।
-- এটি আপনার ওয়েবসাইটের জন্য প্রয়োজনীয় সব টেবিল তৈরি করবে।

-- ধাপ ২: ওয়েবসাইট ভিজিট করুন এবং রেজিস্ট্রেশন করুন
-- আপনার ইমেইল এবং পাসওয়ার্ড দিয়ে একটি নতুন অ্যাকাউন্ট তৈরি করুন।

-- ধাপ ৩: নিজেকে সুপার এডমিন বানান
-- রেজিস্ট্রেশন করার পর, নিচের কোডটি Supabase SQL Editor-এ রান করুন।
-- 'YOUR_EMAIL_HERE' এর জায়গায় আপনার রেজিস্ট্রেশন করা ইমেইলটি বসান।

UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);

-- উদাহরণ:
-- UPDATE public.profiles SET role = 'super_admin' WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@stbff.com');

-- এখন আপনি ওয়েবসাইটে রিফ্রেশ দিলে 'Admin Panel' বাটন দেখতে পাবেন।

