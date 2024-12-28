import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ServiceQuotation } from '../types';
import { QuotationStorage } from '../utils/storage';
import QuotationCard from './QuotationCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888';
const WEBSOCKET_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8888';

export default function QuotationContainer() {
  const [quotations, setQuotations] = useState<ServiceQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      const response = await fetch(`${API_URL}/bar-service-quotations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  };

  const loadQuotations = async () => {
    try {
      // Try to fetch from API
      const apiQuotations = await fetchQuotations();
      if (apiQuotations.length > 0) {
        setQuotations(apiQuotations);
        await QuotationStorage.saveQuotations(apiQuotations);
        setError(null);
      } else {
        // If API returns empty, load from storage
        const storedQuotations = await QuotationStorage.getQuotations();
        setQuotations(storedQuotations);
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
      // On error, load from storage
      const storedQuotations = await QuotationStorage.getQuotations();
      setQuotations(storedQuotations);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);

        if (message.operationType === 'insert') {
          // Handle new quotation insertion
          const newQuotation: ServiceQuotation = message.fullDocument;
          setQuotations((prevQuotations) => [...prevQuotations, newQuotation]);
        } else if (message.operationType === 'delete') {
          // Handle quotation deletion
          const deletedId: string = message.documentKey._id;
          setQuotations((prevQuotations) =>
            prevQuotations.filter((quotation) => quotation._id !== deletedId)
          );
        } else if (message.operationType === 'update') {
          // Handle quotation update
          const updatedQuotation: ServiceQuotation = message.updateDescription.updatedFields;
          setQuotations((prevQuotations) =>
            prevQuotations.map((quotation) =>
              quotation._id === message.documentKey._id ? { ...quotation, ...updatedQuotation } : quotation
            )
          );
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return ws; // Return the WebSocket instance for cleanup
  };

  useEffect(() => {
    loadQuotations();

    // Setup WebSocket connection
    const ws = setupWebSocket();

    // Cleanup WebSocket connection on unmount
    return () => {
      ws.close();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {quotations.map((quotation) => (
        <QuotationCard
          key={quotation._id}
          quotation={quotation}
          onRefresh={loadQuotations}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});


// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, StyleSheet, View } from 'react-native';
// import { ServiceQuotation } from '../types';
// import { QuotationStorage } from '../utils/storage';
// import QuotationCard from './QuotationCard';

// const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888';

// export default function QuotationContainer() {
//   const [quotations, setQuotations] = useState<ServiceQuotation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchQuotations = async () => {
//     try {
//       const response = await fetch(`${API_URL}/bar-service-quotations`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Fetched data:', data); // Debug log
//       return data;
//     } catch (error) {
//       console.error('Error fetching quotations:', error);
//       throw error;
//     }
//   };

//   const loadQuotations = async () => {
//     try {
//       // Try to fetch from API
//       const apiQuotations = await fetchQuotations();
//       if (apiQuotations.length > 0) {
//         setQuotations(apiQuotations);
//         await QuotationStorage.saveQuotations(apiQuotations);
//         setError(null);
//       } else {
//         // If API returns empty, load from storage
//         const storedQuotations = await QuotationStorage.getQuotations();
//         setQuotations(storedQuotations);
//       }
//     } catch (error) {
//       console.error('Error loading quotations:', error);
//       // On error, load from storage
//       const storedQuotations = await QuotationStorage.getQuotations();
//       setQuotations(storedQuotations);
//       setError(error instanceof Error ? error.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadQuotations();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#D4AF37" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {quotations.map((quotation) => (
//         <QuotationCard
//           key={quotation._id}
//           quotation={quotation}
//           onRefresh={loadQuotations}
//         />
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   }
// });