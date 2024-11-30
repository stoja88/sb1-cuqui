import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HelpCircle, Lock, Mail, ChevronDown, ChevronUp, Search, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface LoginForm {
  email: string;
  password: string;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  is_featured: boolean;
}

export function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState<string[]>([]);
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  useEffect(() => {
    const fetchHelpArticles = async () => {
      const { data } = await supabase
        .from('help_articles')
        .select('*')
        .order('order_index', { ascending: true });
      setHelpArticles(data || []);
    };
    fetchHelpArticles();
  }, []);

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedArticles = showAllArticles
    ? filteredArticles
    : filteredArticles.filter(article => article.is_featured);

  const toggleArticle = (id: string) => {
    setExpandedArticles(prev =>
      prev.includes(id)
        ? prev.filter(articleId => articleId !== id)
        : [...prev, id]
    );
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      await signIn(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      setError('Credenciales inválidas. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <HelpCircle className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Portal de Soporte IT
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Inicie sesión para acceder al sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'El correo es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo electrónico inválido'
                    }
                  })}
                  type="email"
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  type="password"
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error de autenticación
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
                loading={loading}
              >
                Iniciar Sesión
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  ¿Necesita ayuda?
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar en la ayuda..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                {displayedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden"
                  >
                    <button
                      className="w-full px-4 py-3 text-left flex items-center justify-between"
                      onClick={() => toggleArticle(article.id)}
                    >
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {article.title}
                      </h3>
                      {expandedArticles.includes(article.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedArticles.includes(article.id) && (
                      <div className="px-4 pb-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {article.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAllArticles(!showAllArticles)}
                  className="text-sm"
                >
                  {showAllArticles ? 'Mostrar menos' : 'Ver todos los artículos'}
                </Button>

                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span className="text-gray-500">¿No encuentra lo que busca?</span>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/tickets/new')}
                    className="text-blue-600 dark:text-blue-400 inline-flex items-center"
                  >
                    Crear ticket
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}