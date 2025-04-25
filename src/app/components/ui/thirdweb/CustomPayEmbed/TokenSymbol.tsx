'use client';
import { type Theme } from '../design-system/index';
import { ERC20OrNativeToken, isNativeToken } from './util';
import { Text } from '../text';
import { Chain, ChainMetadata } from 'thirdweb/chains';

/**
 * @internal
 */
export function TokenSymbol(props: {
  token: ERC20OrNativeToken;
  chain: ChainMetadata;
  size: 'sm' | 'md' | 'lg';
  color?: keyof Theme['colors'];
  inline?: boolean;
}) {
  if (!isNativeToken(props.token)) {
    return (
      <Text
        size={props.size}
        color={props.color || 'primaryText'}
        inline={props.inline}
      >
        {props.token.symbol}
      </Text>
    );
  }

  return (
    <NativeTokenSymbol
      chain={props.chain}
      size={props.size}
      color={props.color}
      inline={props.inline}
    />
  );
}

function NativeTokenSymbol(props: {
  chain: ChainMetadata;
  size: 'sm' | 'md' | 'lg';
  color?: keyof Theme['colors'];
  inline?: boolean;
}) {
  return (
    <Text
      size={props.size}
      color={props.color || 'primaryText'}
      inline={props.inline}
    >
      {props.chain?.nativeCurrency?.symbol ?? 'ETH'}
    </Text>
  );
}
