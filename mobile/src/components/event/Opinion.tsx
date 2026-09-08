import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AvatarLetter, LoginRequired } from '~/components/shared';
import { GetEvaluationsEvent } from '~/services';
import { COLORS } from '~/styles';
import type { Evaluation, EventItem } from '~/types';
import { allowedUser } from '~/utils';

interface Props {
  event: EventItem;
  onWriteOpinion: () => void;
  onRequireLogin: () => void;
  reloadKey?: number;
}

/** Lista de opiniões do evento, com a nota média em estrelas. */
export function Opinion({ event, onWriteOpinion, onRequireLogin, reloadKey }: Props) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [warning, setWarning] = useState(false);

  const load = useCallback(async () => {
    try {
      setEvaluations(await GetEvaluationsEvent(event.id));
    } catch {
      setEvaluations([]);
    }
  }, [event.id]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  async function write() {
    if (!(await allowedUser())) {
      setWarning(true);
      return;
    }
    onWriteOpinion();
  }

  const average = evaluations.length
    ? evaluations.reduce((total, item) => total + item.note, 0) / evaluations.length
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OPINIÕES</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.round(average) ? 'star' : 'star-outline'}
              size={16}
              color={COLORS.YELLOW}
            />
          ))}
        </View>
        <TouchableOpacity onPress={write} hitSlop={12}>
          <Ionicons name="create-outline" size={24} color={COLORS.COLOR_MAIN} />
        </TouchableOpacity>
      </View>

      {evaluations.length === 0 ? (
        <Text style={styles.empty}>Sem comentários no momento</Text>
      ) : (
        evaluations.map((evaluation) => (
          <View key={evaluation.id} style={styles.item}>
            <AvatarLetter uri={evaluation.avatar} name={evaluation.name} size={40} />
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.name}>{evaluation.name}</Text>
                <Text style={styles.date}>{evaluation.last_comment}</Text>
              </View>
              <View style={styles.itemStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= evaluation.note ? 'star' : 'star-outline'}
                    size={12}
                    color={COLORS.YELLOW}
                  />
                ))}
              </View>
              <Text style={styles.comment}>{evaluation.comment}</Text>
            </View>
          </View>
        ))
      )}

      <LoginRequired
        visible={warning}
        message="Para acessar esse recurso, é necessário estar logado."
        onDismiss={() => setWarning(false)}
        onLogin={onRequireLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  comment: { color: COLORS.BLACK, fontSize: 13, lineHeight: 19, marginTop: 4 },
  container: { paddingBottom: 30, paddingHorizontal: 15, paddingVertical: 10 },
  date: { color: COLORS.GRAY, fontSize: 11 },
  empty: { color: COLORS.GRAY, fontSize: 13 },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
  item: { flexDirection: 'row', marginTop: 16 },
  itemContent: { flex: 1, marginLeft: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemStars: { flexDirection: 'row', marginTop: 2 },
  name: { color: COLORS.BLACK, fontSize: 14, fontWeight: 'bold' },
  stars: { flexDirection: 'row', flex: 1, marginLeft: 10 },
  title: { color: COLORS.GRAY, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
});

export default Opinion;
