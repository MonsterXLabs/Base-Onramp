'use client';
import { useState } from 'react';
import { ThirdwebClient } from 'thirdweb';
import { Skeleton } from './Skeleton';

const DEFAULT_GATEWAY = 'https://{clientId}.ipfscdn.io/ipfs/{cid}';

export type ResolveSchemeOptions = {
  client: ThirdwebClient;
  uri: string;
};

export function resolveScheme(options: ResolveSchemeOptions) {
  if (options.uri.startsWith('ipfs://')) {
    const gateway =
      options.client.config?.storage?.gatewayUrl ?? DEFAULT_GATEWAY;
    const clientId = options.client.clientId;
    const cid = findIPFSCidFromUri(options.uri);

    let bundleId: string | undefined = undefined;
    if (typeof globalThis !== 'undefined' && 'Application' in globalThis) {
      // shims use wallet connect RN module which injects Application info in globalThis
      // biome-ignore lint/suspicious/noExplicitAny: get around globalThis typing
      bundleId = (globalThis as any).Application.applicationId;
    }

    // purposefully using SPLIT here and not replace for CID to avoid cases where users don't know the schema
    // also only splitting on `/ipfs` to avoid cases where people pass non `/` terminated gateway urls
    return `${
      gateway.replace('{clientId}', clientId).split('/ipfs')[0]
    }/ipfs/${cid}${bundleId ? `?bundleId=${bundleId}` : ''}`;
  }
  if (options.uri.startsWith('http')) {
    return options.uri;
  }
  throw new Error(`Invalid URI scheme, expected "ipfs://" or "http(s)://"`);
}

export function findIPFSCidFromUri(uri: string) {
  if (!uri.startsWith('ipfs://')) {
    // do not touch URIs that are not ipfs URIs
    return uri;
  }

  // first index of `/Qm` or `/bafy` in the uri (case insensitive)
  const firstIndex = uri.search(/\/(Qm|baf)/i);
  // we start one character after the first `/` to avoid including it in the CID
  return uri.slice(firstIndex + 1);
}

/**
 * @internal
 */
export const Img: React.FC<{
  width?: string;
  height?: string;
  src?: string;
  alt?: string;
  loading?: 'eager' | 'lazy';
  className?: string;
  style?: React.CSSProperties;
  fallbackImage?: string;
  client: ThirdwebClient;
}> = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const propSrc = props.src;

  const widthPx = `${props.width}px`;
  const heightPx = `${props.height || props.width}px`;

  if (propSrc === undefined) {
    return <Skeleton width={widthPx} height={heightPx} />;
  }

  const getSrc = () => {
    try {
      return resolveScheme({
        uri: propSrc,
        client: props.client,
      });
    } catch {
      return props.src;
    }
  };

  const src = getSrc();

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyItems: 'center',
      }}
    >
      {!isLoaded && <Skeleton width={widthPx} height={heightPx} />}
      <img
        onLoad={() => {
          setIsLoaded(true);
        }}
        key={src}
        width={props.width}
        height={props.height}
        src={src}
        alt={props.alt || ''}
        loading={props.loading}
        decoding="async"
        style={{
          objectFit: 'contain',
          height: !isLoaded
            ? 0
            : props.height
              ? `${props.height}px`
              : undefined,
          width: !isLoaded ? 0 : props.width ? `${props.width}px` : undefined,
          userSelect: 'none',
          visibility: isLoaded ? 'visible' : 'hidden',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
          ...props.style,
        }}
        draggable={false}
        className={props.className}
        onError={(e) => {
          if (
            props.fallbackImage &&
            e.currentTarget.src !== props.fallbackImage
          ) {
            e.currentTarget.src = props.fallbackImage;
          }
        }}
      />
    </div>
  );
};
