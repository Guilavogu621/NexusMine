import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (url, onMessage) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const socketUrl = `${url}?token=${token}`;
        socketRef.current = new WebSocket(socketUrl);

        socketRef.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
            // Attempt to reconnect after 5 seconds
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };

        socketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            socketRef.current.close();
        };
    }, [url, onMessage]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    return { isConnected };
};

export default useWebSocket;
