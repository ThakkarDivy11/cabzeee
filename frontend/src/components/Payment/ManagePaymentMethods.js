import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManagePaymentMethods = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingCard, setAddingCard] = useState(false);

    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.data);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    last4: cardData.cardNumber.slice(-4),
                    brand: getCardBrand(cardData.cardNumber),
                    expiryMonth: cardData.expiryMonth,
                    expiryYear: cardData.expiryYear,
                    cardHolderName: cardData.cardHolderName
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Card added successfully');
                setAddingCard(false);
                setCardData({ cardNumber: '', cardHolderName: '', expiryMonth: '', expiryYear: '', cvv: '' });
                fetchUserData();
            } else {
                toast.error(data.message || 'Failed to add card');
            }
        } catch (error) {
            toast.error('Error adding card');
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm('Are you sure you want to remove this card?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/card/${cardId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Card removed');
                fetchUserData();
            }
        } catch (error) {
            toast.error('Error removing card');
        }
    };

    const getCardBrand = (number) => {
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5')) return 'Mastercard';
        return 'Card';
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button onClick={() => navigate('/rider')} className="mr-4 text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">Payment Methods</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Wallet Section */}
                <div className="bg-black text-white rounded-2xl p-6 mb-8 shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">CabZee Wallet Balance</p>
                            <h2 className="text-4xl font-bold mt-2">₹{user?.walletBalance?.toFixed(2) || '0.00'}</h2>
                        </div>
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-6 text-sm text-gray-400">
                        Add Money Coming Soon
                    </div>
                </div>

                {/* Saved Cards Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg font-bold text-gray-900">Saved Cards</h3>
                        <button
                            onClick={() => setAddingCard(true)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            + Add New Card
                        </button>
                    </div>

                    {user?.savedCards?.length === 0 && !addingCard && (
                        <div className="text-center py-8 bg-white rounded-lg border border-gray-200 border-dashed">
                            <p className="text-gray-500">No saved cards yet.</p>
                        </div>
                    )}

                    {user?.savedCards?.map((card) => (
                        <div key={card._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                                    {card.brand}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">•••• •••• •••• {card.last4}</p>
                                    <p className="text-xs text-gray-500">Expires {card.expiryMonth}/{card.expiryYear}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteCard(card._id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    {addingCard && (
                        <div className="bg-white rounded-lg shadow p-6 mt-4">
                            <h3 className="text-lg font-bold mb-4">Add New Card</h3>
                            <form onSubmit={handleAddCard} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <input
                                        type="text"
                                        maxLength="16"
                                        value={cardData.cardNumber}
                                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="0000 0000 0000 0000"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                    <input
                                        type="text"
                                        value={cardData.cardHolderName}
                                        onChange={(e) => setCardData({ ...cardData, cardHolderName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                                        <input
                                            type="text"
                                            maxLength="2"
                                            value={cardData.expiryMonth}
                                            onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="MM"
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
                                        <input
                                            type="text"
                                            maxLength="2"
                                            value={cardData.expiryYear}
                                            onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="YY"
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                        <input
                                            type="password"
                                            maxLength="3"
                                            value={cardData.cvv}
                                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="123"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setAddingCard(false)}
                                        className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-800"
                                    >
                                        Save Card
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ManagePaymentMethods;
