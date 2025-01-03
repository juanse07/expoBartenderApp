
import NetInfo from '@react-native-community/netinfo';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ServiceQuotation } from './src/types';
import { QuotationStorage } from './src/utils/storage';

const theme = {
  primary: '#D4AF37',      // Classic gold
  secondary: '#FFD700',    // Bright gold
  background: '#000000',   // Pure black background
  cardBg: '#1A1A1A',      // Dark gray for cards
  text: '#FFFFFF',         // White text
  textLight: '#B3B3B3',   // Light gray text
  textGold: '#FFD700',    // Gold text
  border: '#333333',      // Dark border
  textGold2: '#B88A2f',
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.4.76:8888';

export default function App() {
  const [quotations, setQuotations] = useState<ServiceQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
          'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
          'Lato-Light': require('./assets/fonts/Lato-Light.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue without custom fonts if loading fails
      }
    }
    loadFonts();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const fetchQuotations = async () => {
    try {
      const isConnected = await QuotationStorage.isConnected();
      
      if (!isConnected) {
        setIsOffline(true);
        const storedQuotations = await QuotationStorage.getQuotations();
        if (storedQuotations.length > 0) {
          // Sort by last updated (assuming `updatedAt` is available)
          storedQuotations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setQuotations(storedQuotations);
          setError(null);
        } else {
          setError('No cached data available');
        }
        return;
      }

      setIsOffline(false);
      const response = await fetch(`${API_URL}/bar-service-quotations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Sort by last updated (assuming `updatedAt` is available)
      data.sort((a: { updatedAt: string | number | Date; }, b: { updatedAt: string | number | Date; }) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setQuotations(data);
      setError(null);
      await QuotationStorage.saveQuotations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      // Load cached data if available
      const storedQuotations = await QuotationStorage.getQuotations();
      if (storedQuotations.length > 0) {
        // Sort by last updated (assuming `updatedAt` is available)
        storedQuotations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setQuotations(storedQuotations);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>DenverBartenders</Text>
        {isOffline && <Text style={styles.offlineText}>Offline Mode - Using Cached Data</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              fetchQuotations();
            }}
            tintColor={theme.primary}
          />
        }
      >
        {quotations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quotations found</Text>
          </View>
        ) : (
          quotations.map((quotation) => (
            <View key={quotation._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.clientName}>{quotation.clientName}</Text>
                <Text style={styles.companyName}>{quotation.companyName}</Text>
              </View>
              
              <View style={styles.cardDivider} />
              
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Event Date</Text>
                  <Text style={styles.value}>{formatDate(quotation.eventDate)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Time</Text>
                  <Text style={styles.value}>{quotation.startTime} - {quotation.endTime}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Guests</Text>
                  <Text style={styles.value}>{quotation.numberOfGuests}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Services</Text>
                  <Text style={styles.value}>{quotation.servicesRequested.join(', ')}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{quotation.email}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phone</Text>
                  <Text style={styles.value}>{quotation.phone}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.value}>{quotation.address}</Text>
                </View>
                
                {quotation.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesText}>{quotation.notes}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={styles.timestamp}>
                  Created: {formatDate(quotation.createdAt)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    marginTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    padding: 20,
    backgroundColor: theme.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.textGold2,
    textAlign: 'center',
    fontFamily: 'Lato-Bold',
  },
  offlineText: {
    color: theme.secondary,
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.cardBg,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    padding: 16,
    backgroundColor: theme.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: '#0D0D0D',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  clientName: {
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    color: theme.background,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: theme.background,
    opacity: 0.9,
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.border,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    width: 100,
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: theme.textGold,
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: theme.text,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0D0D0D',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: theme.textGold,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: theme.text,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    color: theme.textLight,
    textAlign: 'right',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: theme.primary,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: theme.textLight,
    textAlign: 'center',
  },
});


// import NetInfo from '@react-native-community/netinfo';
// import * as Font from 'expo-font';
// import { StatusBar } from 'expo-status-bar';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
// import { ServiceQuotation } from './src/types';
// import { QuotationStorage } from './src/utils/storage';

// const theme = {
//   primary: '#D4AF37',      // Classic gold
//   secondary: '#FFD700',    // Bright gold
//   background: '#000000',   // Pure black background
//   cardBg: '#1A1A1A',      // Dark gray for cards
//   text: '#FFFFFF',         // White text
//   textLight: '#B3B3B3',   // Light gray text
//   textGold: '#FFD700',    // Gold text
//   border: '#333333',      // Dark border
// };

// const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.4.76:8888';

// export default function App() {
//   const [quotations, setQuotations] = useState<ServiceQuotation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [fontsLoaded, setFontsLoaded] = useState(false);
//   const [isOffline, setIsOffline] = useState(false);

//   // Load fonts
//   useEffect(() => {
//     async function loadFonts() {
//       try {
//         await Font.loadAsync({
//           'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
//           'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
//           'Lato-Light': require('./assets/fonts/Lato-Light.ttf'),
//         });
//         setFontsLoaded(true);
//       } catch (error) {
//         console.error('Error loading fonts:', error);
//         setFontsLoaded(true); // Continue without custom fonts if loading fails
//       }
//     }
//     loadFonts();
//   }, []);

//   // Network status monitoring
//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener(state => {
//       setIsOffline(!state.isConnected);
//     });

//     return () => unsubscribe();
//   }, []);

//   const fetchQuotations = async () => {
//     try {
//       const isConnected = await QuotationStorage.isConnected();
      
//       if (!isConnected) {
//         setIsOffline(true);
//         const storedQuotations = await QuotationStorage.getQuotations();
//         if (storedQuotations.length > 0) {
//           setQuotations(storedQuotations);
//           setError(null);
//         } else {
//           setError('No cached data available');
//         }
//         return;
//       }

//       setIsOffline(false);
//       const response = await fetch(`${API_URL}/bar-service-quotations`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       setQuotations(data);
//       setError(null);
//       await QuotationStorage.saveQuotations(data);
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
//       setError(errorMessage);
      
//       // Load cached data if available
//       const storedQuotations = await QuotationStorage.getQuotations();
//       if (storedQuotations.length > 0) {
//         setQuotations(storedQuotations);
//         setIsOffline(true);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchQuotations();
//   }, []);

//   if (!fontsLoaded || loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={theme.primary} />
//           <Text style={styles.loadingText}>Loading...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString();
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="light" />
//       <View style={styles.header}>
//         <span style={styles.headerText}>DenverBartenders</span>
//         {isOffline && <Text style={styles.offlineText}>Offline Mode - Using Cached Data</Text>}
//         {error && <Text style={styles.errorText}>{error}</Text>}
//       </View>
      
//       <ScrollView 
//         contentContainerStyle={styles.scrollContainer}
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={() => {
//               setRefreshing(true);
//               fetchQuotations();
//             }}
//             tintColor={theme.primary}
//           />
//         }
//       >
//         {quotations.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>No quotations found</Text>
//           </View>
//         ) : (
//           quotations.map((quotation) => (
//             <View key={quotation._id} style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <Text style={styles.clientName}>{quotation.clientName}</Text>
//                 <Text style={styles.companyName}>{quotation.companyName}</Text>
//               </View>
              
//               <View style={styles.cardDivider} />
              
//               <View style={styles.cardContent}>
//                 <View style={styles.infoRow}>
//                   <Text style={styles.label}>Event Date</Text>
//                   <Text style={styles.value}>{formatDate(quotation.eventDate)}</Text>
//                 </View>
                
//                 <View style={styles.infoRow}>
//                   <Text style={styles.label}>Time</Text>
//                   <Text style={styles.value}>{quotation.startTime} - {quotation.endTime}</Text>
//                 </View>
                
//                 <View style={styles.infoRow}>
//                   <Text style={styles.label}>Guests</Text>
//                   <Text style={styles.value}>{quotation.numberOfGuests}</Text>
//                 </View>
                
//                 <View style={styles.infoRow}>
//                   <Text style={styles.label}>Services</Text>
//                   <Text style={styles.value}>{quotation.servicesRequested.join(', ')}</Text>
//                 </View>
                
//                 <View style={styles.infoRow}>
//                   <Text style={styles.label}>Email</Text>
//                   <Text style={styles.value}>{quotation.email}</Text>
//                 </View>
                
//                 <View style={styles.infoRow}>
//                   <Text style={styles.label}>Phone</Text>
//                   <Text style={styles.value}>{quotation.phone}</Text>
//                 </View>
                
//                 <View style={styles.infoRow}>
//                   <Text style={styles.label}>Address</Text>
//                   <Text style={styles.value}>{quotation.address}</Text>
//                 </View>
                
//                 {quotation.notes && (
//                   <View style={styles.notesContainer}>
//                     <Text style={styles.notesLabel}>Notes</Text>
//                     <Text style={styles.notesText}>{quotation.notes}</Text>
//                   </View>
//                 )}
//               </View>
              
//               <View style={styles.cardFooter}>
//                 <Text style={styles.timestamp}>
//                   Created: {formatDate(quotation.createdAt)}
//                 </Text>
//               </View>
//             </View>
//           ))
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.background,
//     marginTop: Platform.OS === 'android' ? 25 : 0,
//   },
//   header: {
//     padding: 20,
//     backgroundColor: theme.cardBg,
//     borderBottomWidth: 1,
//     borderBottomColor: theme.border,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.5,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   headerText: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#B88A2',
//     textAlign: 'center',
//     fontFamily: 'Lato-Bold',
  
//   },
//   offlineText: {
//     color: theme.secondary,
//     fontSize: 12,
//     fontFamily: 'Lato-Regular',
//     textAlign: 'center',
//     marginTop: 4,
//   },
//   scrollContainer: {
//     padding: 16,
//   },
//   card: {
//     backgroundColor: theme.cardBg,
//     borderRadius: 12,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.5,
//     shadowRadius: 8,
//     elevation: 5,
//     borderWidth: 1,
//     borderColor: theme.border,
//   },
//   cardHeader: {
//     padding: 16,
//     backgroundColor: theme.primary,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   cardContent: {
//     padding: 16,
//   },
//   cardFooter: {
//     padding: 12,
//     borderTopWidth: 1,
//     borderTopColor: theme.border,
//     backgroundColor: '#0D0D0D',
//     borderBottomLeftRadius: 12,
//     borderBottomRightRadius: 12,
//   },
//   clientName: {
//     fontSize: 20,
//     fontFamily: 'Lato-Bold',
//     color: theme.background,
//     marginBottom: 4,
//   },
//   companyName: {
//     fontSize: 16,
//     fontFamily: 'Lato-Regular',
//     color: theme.background,
//     opacity: 0.9,
//   },
//   cardDivider: {
//     height: 1,
//     backgroundColor: theme.border,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     marginBottom: 12,
//     alignItems: 'center',
//   },
//   label: {
//     width: 100,
//     fontSize: 14,
//     fontFamily: 'Lato-Bold',
//     color: theme.textGold,
//   },
//   value: {
//     flex: 1,
//     fontSize: 14,
//     fontFamily: 'Lato-Regular',
//     color: theme.text,
//   },
//   notesContainer: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: '#0D0D0D',
//     borderRadius: 8,
//   },
//   notesLabel: {
//     fontSize: 14,
//     fontFamily: 'Lato-Bold',
//     color: theme.textGold,
//     marginBottom: 4,
//   },
//   notesText: {
//     fontSize: 14,
//     fontFamily: 'Lato-Light',
//     color: theme.text,
//     fontStyle: 'italic',
//   },
//   timestamp: {
//     fontSize: 12,
//     fontFamily: 'Lato-Regular',
//     color: theme.textLight,
//     textAlign: 'right',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     fontFamily: 'Lato-Regular',
//     color: theme.primary,
//   },
//   errorText: {
//     color: '#FF4444',
//     fontSize: 14,
//     fontFamily: 'Lato-Regular',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   emptyContainer: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//     fontFamily: 'Lato-Regular',
//     color: theme.textLight,
//     textAlign: 'center',
//   },

// });