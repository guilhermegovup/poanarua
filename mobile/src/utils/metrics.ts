/**
 * O app original mandava esses eventos para o Firebase Analytics. Aqui ficam
 * centralizados num único ponto: basta plugar o SDK escolhido.
 */
export function sendMetrics(action: string) {
  if (__DEV__) console.log('[metrics]', action);
}

export function sendMetricsEventOpen(name: string) {
  sendMetrics(name);
}

export function sendMetricsEvent(payload: {
  event_app_screen: string;
  action: string;
  name: string;
  category?: number;
  id: number;
}) {
  if (__DEV__) console.log('[metrics]', payload);
}
