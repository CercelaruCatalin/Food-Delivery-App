'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "../hooks/User/user";
import Loading from "../../components/loading/loading";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [image, setImage] = useState(null);
  
  const { user, updateField, updateUser } = useUser();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) throw new Error("Failed to fetch profile");
        
        const data = await response.json();
        const nameParts = data.name ? data.name.split(" ") : ["", ""];
        
        updateUser({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phoneNumber: data.phone_number || "",
          streetAddress: data.street_address || "",
          postalCode: data.postal_code || "",
          city: data.city || "",
          dateOfBirth: data.date_of_birth ? data.date_of_birth.split("T")[0] : ""
        });
  
        if (data.image) {
          setImage(data.image);
        }
        else {
          setImage(session.user.image);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
  
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, updateUser]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // doar cifre
    const onlyDigits = value.replace(/\D/g, "");

    // Limiteaza la 10 caractere
    const limitedDigits = onlyDigits.slice(0, 10);

    updateField(name, limitedDigits);
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    const combinedName = `${user.firstName} ${user.lastName}`.trim();
    
    const updatePromise = fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: combinedName,
        phoneNumber: user.phoneNumber,
        streetAddress: user.streetAddress,
        postalCode: user.postalCode,
        city: user.city,
        dateOfBirth: user.dateOfBirth,
      })
    }).then(res => res.json());
  
    await toast.promise(updatePromise, {
      loading: 'Saving...',
      success: 'Profile updated!',
      error: (err) => `Error: ${err.message}`
    });
  };

  async function handleFileChange(ev) {
    const file = ev.target.files[0];
    if (!file) return;
  
    const data = new FormData();
    data.append("file", file);
  
    const uploadPromise = fetch("/api/upload", {
      method: "POST",
      body: data,
    }).then(async (response) => {
      if (response.ok) {
        const result = await response.json();
        console.log("URL nou:", result.url);
        setImage(result.url);
        return result.url;
      }
      throw new Error("Upload failed!");
    });
  
    await toast.promise(uploadPromise, {
      loading: "Uploading...",
      success: "Upload complete!",
      error: "Upload error!",
    });
  }

  if (status === "loading"){
    return (
      <Loading baseSize={8} mdSize={12} lgSize={16} borderWidth={3} />
    );
  }
  if (status === "unauthenticated") redirect("/login");

  return (
    <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 mt-20">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Personal Profile</h1>
        <p className="mt-2 text-sm text-gray-500">Update your information and profile picture</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Profile Picture Section */}
          <div className="md:w-1/3 bg-gradient-to-br from-primary to-secondary p-8 flex flex-col items-center justify-center text-white">
            <div className="relative mb-6 group">
              {image ? (
                <div className="w-full aspect-square rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  <Image
                    className="w-full h-full object-cover"
                    src={image}
                    alt="Profile"
                    width={250}
                    height={250}
                    priority={false}
                  />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-full overflow-hidden ring-4 ring-white bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              
              <label className="absolute bottom-0 right-0">
                <div className="bg-white text-primary p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-blue-100 text-xl">{session.user.email}</p>
          </div>
          
          {/* Form Section */}
          <div className="md:w-2/3 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    name="firstName"
                    placeholder="Enter your first name"
                    value={user.firstName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    name="lastName"
                    placeholder="Enter your last name"
                    value={user.lastName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={session.user.email}
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Your email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={user.phoneNumber}
                  onChange={handleNumberChange}
                  onKeyDown={handleNumberKeyPress}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    name="postalCode"
                    placeholder="Enter postal code"
                    value={user.postalCode}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    name="city"
                    placeholder="Enter city"
                    value={user.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  name="streetAddress"
                  placeholder="Enter your street address"
                  value={user.streetAddress}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={user.dateOfBirth}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-6 rounded-lg hover:from-primary hover:to-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}