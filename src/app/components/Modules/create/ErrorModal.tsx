import Image from 'next/image';
import BaseButton from '../../ui/BaseButton';

export default function ErrorModal({
  data,
  close,
  title,
}: {
  data: Array<any> | string;
  close: any;
  title: string;
}) {
  const convertPath = (path: string): string => {
    const convertLang = {
      // basic detail for create nft
      productName: 'Product name',
      productDescription: 'Description',
      price: 'Price',
      selectedArtist: 'Select Artist',
      curation: 'Select Curation',
    };
    return convertLang[path] || path;
  };

  return (
    <div className="flex flex-col gap-y-6 items-center content-center w-[100%] p-3">
      <div className="flex gap-x-3 items-center">
        <Image
          quality={100}
          src="/icons/info.svg"
          className="w-10"
          width={40}
          height={40}
          alt="icon"
        />
        <p className="text-[28px] font-extrabold">{title}</p>
      </div>
      <div className="flex flex-col gap-y-2 mb-[56px]">
        {Array.isArray(data) ? (
          data.map((item: any, index: number) => {
            const path = convertPath(item.path[0]);
            return (
              <div
                key={index}
                className="text-white/[53%] azeret-mono-font text-lg lg:text-xl xl:text-[22px] flex items-center gap-x-2 self-start align-text-top break-words"
                style={{ alignItems: 'self-start' }}
              >
                <p>{index + 1}. </p>
                {path === 'shipping_accept' ? (
                  <p>
                    Please check the box to agree to the
                    <strong>
                      {' '}
                      Consent for collection and usage of personal information
                    </strong>
                  </p>
                ) : (
                  <>
                    <strong>
                      {path.slice(0, 1).toUpperCase() + path.slice(1)}{' '}
                    </strong>
                    <p>is invalid</p>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-white/[53%] azeret-mono-font text-lg break-words">
            {data}
          </p>
        )}
      </div>
      <BaseButton
        title="I Agree"
        variant="primary"
        onClick={close}
        className="max-w-[210px]"
      />
    </div>
  );
}
