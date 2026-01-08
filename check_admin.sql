select id,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at
from auth.users
where email = 'vishal.pandey1912@gmail.com';