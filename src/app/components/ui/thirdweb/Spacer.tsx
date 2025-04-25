import { spacing } from './design-system';

/**
 * @internal
 */
export const Spacer: React.FC<{ y: keyof typeof spacing }> = ({ y }) => {
  return (
    <div
      style={{
        height: spacing[y],
      }}
    />
  );
};
