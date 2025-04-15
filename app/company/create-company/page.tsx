"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Energy",
  "Agriculture",
  "Transportation",
  "Construction",
  "Entertainment",
  "Hospitality",
  "Real Estate",
  "Others"
];

export default function CreateCompany() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo: '',
    industry: '',
    location: '',
    walletAddress: '',
    agreeToTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setFormData(prev => ({ ...prev, walletAddress: accounts[0] }));
          console.log("Wallet address connected is: ", accounts[0]);
          setMessage({ type: 'success', content: 'Wallet connected successfully!' });
        }
      } else {
        setMessage({ type: 'error', content: 'MetaMask not installed. Please install MetaMask to continue.' });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setMessage({ type: 'error', content: 'Failed to connect wallet. Please try again.' });
    }
  };

  const registerCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/registerCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register company');
      }

      setMessage({ type: 'success', content: 'Company registered successfully! Verifying address...' });
      console.log("Verifying wallet address: ", formData.walletAddress);
      await verifyWalletAddress(formData.walletAddress);
      
      setTimeout(() => {
        router.push('/company/dashboard');
      }, 2000);
    } catch (error: unknown) {
      console.error("Registration error:", error);
      setMessage({ 
        type: 'error', 
        content: error instanceof Error ? error.message : 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyWalletAddress = async (walletAddress: string) => {
    try {
      // Call our API endpoint to verify the wallet address using the server's private key
      setMessage({ type: 'info', content: 'Verifying your wallet address...' });
      
      const response = await fetch('/api/verifyCompanyAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      
      if (data.isVerified) {
        setMessage({ 
          type: 'success', 
          content: data.message || 'Wallet address verified successfully!' 
        });
      } else {
        setMessage({ 
          type: 'warning', 
          content: 'Verification status unclear. Please check with administrator.' 
        });
      }
    } catch (error: unknown) {
      console.error("Verification error:", error);
      setMessage({ 
        type: 'error', 
        content: `Verification failed: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Register Your Company</h1>
      
      {message.content && (
        <div className={`p-4 mb-6 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {message.content}
        </div>
      )}
      
      <form onSubmit={registerCompany} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Company Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-1">Website URL *</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="logo" className="block text-sm font-medium mb-1">Logo URL</label>
          <input
            type="url"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="industry" className="block text-sm font-medium mb-1">Industry *</label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="walletAddress" className="block text-sm font-medium mb-1">Wallet Address *</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="0x..."
            />
            <button
              type="button"
              onClick={connectWallet}
              className="bg-blue-500 text-white p-2 rounded-md whitespace-nowrap"
            >
              Connect Wallet
            </button>
          </div>
        </div>
        
        <div className="flex items-start">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleCheckbox}
            required
            className="mt-1 mr-2"
          />
          <label htmlFor="agreeToTerms" className="text-sm">
            I agree to the terms of service and privacy policy *
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-3 rounded-md ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium`}
        >
          {isLoading ? 'Registering...' : 'Register Company'}
        </button>
      </form>
    </div>
  );
}