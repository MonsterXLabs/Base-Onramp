'use client';

import CreateNft from '@/app/components/Modules/CreateNft';
import NftServices from '@/services/legacy/nftService';
import { useEffect, useState } from 'react';

export default function Page({ params }: { params: { slug: string } }) {
  const nftId = params.slug;
  const nftService = new NftServices();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!formData) {
      const fetchData = async () => {
        const response = await nftService.getNftById(nftId);

        if (response.data && response.data.nft) {
          console.log(response.data.nft);
          setFormData(response.data.nft);
        }
      };

      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  return (
    <div>
      <CreateNft editMode={formData} />
    </div>
  );
}
