import { useState, useEffect, useCallback } from 'react';

const useNotifications = () => {
  const [toasts, setToasts] = useState([]);
  const [eventSource, setEventSource] = useState(null);

  const addToast = useCallback((type, message, data = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type,
      message,
      timestamp: new Date().toISOString(),
      ...data
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const connectToNotifications = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    const es = new EventSource('http://localhost:3001/api/notifications');
    
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'connected') {
          addToast(data.type, data.message, data);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    es.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        connectToNotifications();
      }, 3000);
    };

    es.onopen = () => {
      console.log('Connected to notification stream');
    };

    setEventSource(es);
    
    return es;
  }, [addToast, eventSource]);

  useEffect(() => {
    const es = connectToNotifications();
    
    return () => {
      if (es) {
        es.close();
      }
    };
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    connectToNotifications
  };
};

export default useNotifications;