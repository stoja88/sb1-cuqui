import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  MessageSquare, 
  Clock, 
  User,
  AlertCircle,
  CheckCircle2,
  History,
  Send,
  Edit,
  UserPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { Ticket, User as UserType } from '../types';

interface Comment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
}

interface TicketHistory {
  id: string;
  ticket_id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

interface CommentForm {
  content: string;
}

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [supportUsers, setSupportUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<CommentForm>();

  useEffect(() => {
    fetchTicketData();
    fetchSupportUsers();
    const subscription = subscribeToUpdates();
    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const subscribeToUpdates = () => {
    return supabase
      .channel(`ticket-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets',
        filter: `id=eq.${id}`
      }, (payload) => {
        if (payload.new) {
          setTicket(payload.new as Ticket);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_comments',
        filter: `ticket_id=eq.${id}`
      }, (payload) => {
        setComments(prev => [...prev, payload.new as Comment]);
      })
      .subscribe();
  };

  const fetchTicketData = async () => {
    try {
      const [ticketData, commentsData, historyData] = await Promise.all([
        supabase
          .from('tickets')
          .select(`
            *,
            created_by_user:created_by(full_name, email),
            assigned_to_user:assigned_to(full_name, email)
          `)
          .eq('id', id)
          .single(),
        supabase
          .from('ticket_comments')
          .select(`
            *,
            user:user_id(full_name, email)
          `)
          .eq('ticket_id', id)
          .order('created_at', { ascending: true }),
        supabase
          .from('ticket_history')
          .select(`
            *,
            user:user_id(full_name)
          `)
          .eq('ticket_id', id)
          .order('created_at', { ascending: false })
      ]);

      setTicket(ticketData.data);
      setComments(commentsData.data || []);
      setHistory(historyData.data || []);
    } catch (error) {
      console.error('Error al cargar datos del ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'support']);
      setSupportUsers(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios de soporte:', error);
    }
  };

  const onSubmitComment = async (data: CommentForm) => {
    try {
      const { error } = await supabase
        .from('ticket_comments')
        .insert([
          {
            ticket_id: id,
            user_id: user?.id,
            content: data.content
          }
        ]);

      if (error) throw error;
      
      await supabase
        .from('ticket_history')
        .insert([
          {
            ticket_id: id,
            user_id: user?.id,
            action: 'comment',
            details: 'Añadió un comentario'
          }
        ]);

      reset();
    } catch (error) {
      console.error('Error al añadir comentario:', error);
    }
  };

  const updateTicketStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      await supabase
        .from('ticket_history')
        .insert([
          {
            ticket_id: id,
            user_id: user?.id,
            action: 'status',
            details: `Cambió el estado a ${status}`
          }
        ]);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const assignTicket = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: userId })
        .eq('id', id);

      if (error) throw error;

      const assignedUser = supportUsers.find(u => u.id === userId);
      await supabase
        .from('ticket_history')
        .insert([
          {
            ticket_id: id,
            user_id: user?.id,
            action: 'assign',
            details: `Asignó el ticket a ${assignedUser?.full_name}`
          }
        ]);
    } catch (error) {
      console.error('Error al asignar ticket:', error);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!ticket) {
    return <div>Ticket no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <div className="flex items-center space-x-2">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                  ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'}
              `}>
                {ticket.status}
              </span>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'}
              `}>
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p>{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Creado por: {ticket.created_by_user.full_name}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Fecha: {new Date(ticket.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Asignado a: {ticket.assigned_to_user?.full_name || 'Sin asignar'}
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Categoría: {ticket.category}
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => updateTicketStatus(e.target.value)}
              value={ticket.status}
            >
              <option value="open">Abierto</option>
              <option value="in_progress">En Progreso</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => assignTicket(e.target.value)}
              value={ticket.assigned_to || ''}
            >
              <option value="">Asignar a...</option>
              {supportUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Comentarios
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {comment.user.full_name[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {comment.user.full_name}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}

              <form onSubmit={handleSubmit(onSubmitComment)} className="mt-4">
                <div className="flex space-x-4">
                  <input
                    {...register('content', { required: true })}
                    type="text"
                    placeholder="Escribe un comentario..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Historial
              </h2>
            </div>
            <div className="p-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  {history.map((event, eventIdx) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {eventIdx !== history.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`
                              h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                              ${event.action === 'comment' ? 'bg-blue-500' :
                                event.action === 'status' ? 'bg-green-500' :
                                'bg-gray-500'}
                            `}>
                              {event.action === 'comment' ? (
                                <MessageSquare className="h-5 w-5 text-white" />
                              ) : event.action === 'status' ? (
                                <CheckCircle2 className="h-5 w-5 text-white" />
                              ) : (
                                <Edit className="h-5 w-5 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {event.user.full_name}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  {new Date(event.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {event.details}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}