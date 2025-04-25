'use client';
import { Chain, ThirdwebClient } from 'thirdweb';
import { iconSize } from './design-system/index';
import { Img } from './Img';

/**
 * @internal
 */
export function TokenIcon(props: {
  chain: Chain;
  size: keyof typeof iconSize;
  client: ThirdwebClient;
}) {
  const tokenImage = props.chain?.icon?.url;

  return (
    <Img
      src={tokenImage || ''}
      width={iconSize[props.size]}
      height={iconSize[props.size]}
      client={props.client}
    />
  );
}
