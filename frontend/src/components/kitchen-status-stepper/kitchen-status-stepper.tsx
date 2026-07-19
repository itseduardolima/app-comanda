import { Text as RNText, View } from 'react-native';
import { t } from '../../i18n';
import { KITCHEN_STATUS_SEQUENCE, KitchenStatus } from '../../types/order';
import { useStyles } from './kitchen-status-stepper.styles';

const STEP_LABEL_KEYS = [
  'kitchen.stepSent',
  'kitchen.stepPreparing',
  'kitchen.stepReady',
  'kitchen.stepDelivered',
] as const;

/**
 * Kitchen progress (screens 4A–4D, prototype design): four stage labels over
 * a progress bar whose fill width/color tracks the current stage — past
 * stages read green, the current one takes its stage color, future ones fade.
 */
export function KitchenStatusStepper({ status }: { status: KitchenStatus }) {
  const styles = useStyles();
  const currentIndex = KITCHEN_STATUS_SEQUENCE.indexOf(status);
  const currentLabelStyle = {
    queued: styles.labelQueued,
    preparing: styles.labelPreparing,
    ready: styles.labelReady,
    delivered: styles.labelDelivered,
  }[status];
  const fillStyle = {
    queued: styles.fillQueued,
    preparing: styles.fillPreparing,
    ready: styles.fillReady,
    delivered: styles.fillDelivered,
  }[status];

  return (
    <View>
      <View style={styles.labels}>
        {STEP_LABEL_KEYS.map((labelKey, index) => (
          <RNText
            key={labelKey}
            style={[
              styles.labelText,
              index < currentIndex
                ? styles.labelPast
                : index === currentIndex
                  ? currentLabelStyle
                  : styles.labelFuture,
            ]}
          >
            {t(labelKey)}
          </RNText>
        ))}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}
