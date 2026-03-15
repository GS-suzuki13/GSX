import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import splashImage from '../assets/logo.png';
import { LoggedUser } from '../types';

export default function PostLoginSplash() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleProceed = () => {
    const storedUser = localStorage.getItem('loggedUser');

    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user: LoggedUser = JSON.parse(storedUser);

      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      localStorage.removeItem('loggedUser');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao validar usuário:', error);
      localStorage.removeItem('loggedUser');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-black">
      <div
        onClick={handleOpenModal}
        className="absolute inset-0"
      >
        <img
          src={splashImage}
          alt="GSX"
          className="w-full h-full object-cover select-none"
          draggable={false}
        />
      </div>

      {showModal && (
        <div className="absolute inset-0 bg-black/55 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-3">
              Opss.. Tela desatualizada.
            </h2>

            <p className="text-gray-300 mb-6">
              Bem-vindo ao novo Dashboard GSX
            </p>

            <button
              onClick={handleProceed}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition font-medium"
            >
              Prosseguir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}