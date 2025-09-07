'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typeOfUser, setTypeOfUser] = useState('user');
  const router = useRouter();

  const USER_TYPES = {
    USER: 'user',
    COURIER: 'courier'
  };

  const changeTypeOfUser = (userType) => {
    setTypeOfUser(userType);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== checkPassword) {
      setError("The passwords don t match");
      setLoading(false);
      return;
    }

    if (!typeOfUser) {
      setError("Please select an account type");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          checkPassword,
          typeOfUser,
          firstName,
          lastName,
          phoneNumber
        }),
      });
      
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || 'Register failed');
      }
      
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

    const handleNumberChange = (e) => {
    const { value } = e.target;
    // doar cifre
    const onlyDigits = value.replace(/\D/g, "");

    // Limiteaza la 10 caractere
    const limitedDigits = onlyDigits.slice(0, 10);

    setPhoneNumber(limitedDigits);
  };

  const handleNumberKeyPress = (e) => {
    // Permite doar cifre (0-9), backspace, delete, tab, escape, enter
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
    const isNumber = /[0-9]/.test(e.key);
    
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
    
    // Previne introducerea de mai mult de 10 caractere
    if (isNumber && e.target.value.length >= 10) {
      e.preventDefault();
    }
  };

  return (
    <section className="max-w-md mx-auto mt-20">
      <h1 className="text-center text-primary text-4xl mb-4">Register</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
     
      <form onSubmit={handleSubmit} className="space-y-4">
          {typeOfUser === USER_TYPES.COURIER && (
            <>
              <div>
                <label className="block mb-2">First Name</label>
                <input
                  id='firstName'
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border rounded" />
              </div>

              <div>
                  <label className="block mb-2">Last Name</label>
                  <input
                    id='lastName'
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={handleNumberChange}
                  onKeyDown={handleNumberKeyPress}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
            </>

          )}

        <div>
          <label htmlFor="email" className="block mb-2">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
       
        <div>
          <label htmlFor="password" className="block mb-2">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
       
        <div>
          <label htmlFor="checkPassword" className="block mb-2">Confirm password</label>
          <input
            id="checkPassword"
            type="password"
            value={checkPassword}
            onChange={(e) => setCheckPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="space-y-3">
          <label className="block mb-2 font-medium">Account Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="userType"
                value={USER_TYPES.USER}
                checked={typeOfUser === USER_TYPES.USER}
                onChange={(e) => changeTypeOfUser(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Customer</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="userType"
                value={USER_TYPES.COURIER}
                checked={typeOfUser === USER_TYPES.COURIER}
                onChange={(e) => changeTypeOfUser(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Courier</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="mb-4">Continue with</p>
        <button
          onClick={() => signIn('google')}
          className="flex items-center justify-center gap-2 w-full border p-2 rounded hover:bg-gray-100"
        >
          <Image src="/google.png" alt="Google" width={20} height={20} />
          Google sign in
        </button>
      </div>

      <p className="mt-6 text-center">
        You already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in here
        </Link>
      </p>
    </section>
  );
}