import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ServiceQuotation } from '../types';

interface QuotationCardProps {
  quotation: ServiceQuotation;
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

export default function QuotationCard({ quotation }: QuotationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.clientName}>{quotation.clientName}</Text>
        <Text style={styles.companyName}>{quotation.companyName}</Text>
      </View>

      <View style={styles.infoSection}>
        <InfoRow label="Event Date" value={formatDate(quotation.eventDate)} />
        <InfoRow label="Time" value={`${quotation.startTime} - ${quotation.endTime}`} />
        <InfoRow label="Guests" value={quotation.numberOfGuests.toString()} />
        <InfoRow label="Email" value={quotation.email} />
        <InfoRow label="Phone" value={quotation.phone} />
        <InfoRow label="Address" value={quotation.address} />
        <InfoRow label="Services" value={quotation.servicesRequested.join(', ')} />
        {quotation.notes && <InfoRow label="Notes" value={quotation.notes} />}
      </View>

      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          Created: {formatDate(quotation.createdAt)}
        </Text>
      </View>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  companyName: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  label: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});