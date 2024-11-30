import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

interface PortalSettings {
  portal_name: string;
  company_logo: string;
  primary_color: string;
  enable_notifications: boolean;
  ticket_categories: string[];
  asset_types: string[];
  auto_assignment: boolean;
  sla_hours: number;
}

export function Settings() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<PortalSettings>();

  const onSubmit = async (data: PortalSettings) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('portal_settings')
        .upsert([{
          id: 1,
          ...data,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      // Recargar la página para aplicar los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-500">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Portal</h1>
          <p className="mt-1 text-sm text-gray-500">
            Personaliza la apariencia y funcionamiento del portal de soporte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Configuración General
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Portal
                </label>
                <input
                  {...register('portal_name', { required: true })}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL del Logo
                </label>
                <input
                  {...register('company_logo')}
                  type="url"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Color Primario
                </label>
                <input
                  {...register('primary_color')}
                  type="color"
                  className="mt-1 block w-full rounded-md border border-gray-300 h-10"
                />
              </div>

              <div className="flex items-center">
                <input
                  {...register('enable_notifications')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Activar Notificaciones
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Horas SLA
                </label>
                <input
                  {...register('sla_hours', { 
                    required: true,
                    min: 1,
                    max: 72
                  })}
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categorías de Tickets
                </label>
                <textarea
                  {...register('ticket_categories')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Una categoría por línea"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipos de Activos
                </label>
                <textarea
                  {...register('asset_types')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Un tipo por línea"
                  rows={4}
                />
              </div>

              <div className="flex items-center">
                <input
                  {...register('auto_assignment')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Asignación Automática de Tickets
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar
                </Button>
                <Button type="submit" loading={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Vista Previa
            </h2>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">
                La vista previa de los cambios se mostrará aquí
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}