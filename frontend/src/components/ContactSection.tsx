import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    mensagem: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ nome: '', email: '', mensagem: '' });

    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <section id="contato" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Entre em Contato
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos prontos para ajudá-lo a alcançar seus objetivos financeiros
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-8">Informações de Contato</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-secondary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Endereço</h4>
                  <p className="text-gray-600">Rua das Finanças, 123 - Centro<br />São Paulo - SP</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="w-6 h-6 text-secondary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">E-mail</h4>
                  <a href="mailto:contato@gsx.com.br" className="text-gray-600 hover:text-secondary transition-colors">
                    contato@gsx.com.br
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-6 h-6 text-secondary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Telefone</h4>
                  <a href="tel:+5511999999999" className="text-gray-600 hover:text-secondary transition-colors">
                    +55 (11) 99999-9999
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-primary rounded-lg text-white">
              <h4 className="text-xl font-semibold mb-4">Horário de Atendimento</h4>
              <div className="space-y-2">
                <p>Segunda à Sexta: 9:00 - 18:00</p>
                <p>Sábado: 9:00 - 13:00</p>
                <p>Domingo: Fechado</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-primary mb-6">Envie uma Mensagem</h3>
            
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-primary mb-2">Mensagem Enviada!</h4>
                <p className="text-gray-600">Obrigado pelo contato. Responderemos em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.mensagem}
                    onChange={(e) => handleInputChange('mensagem', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary resize-none"
                    placeholder="Como podemos ajudá-lo?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-secondary/50 text-primary font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;