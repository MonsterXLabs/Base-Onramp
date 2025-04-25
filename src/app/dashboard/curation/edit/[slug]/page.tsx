'use client';

import CreateCuration from '@/app/components/Modules/CreateCuration';
import { collectionServices } from '@/services/legacy/supplier';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const [formData, setFormData] = useState(null);

  const fetchData = async () => {
    const collection = await collectionServices.getCollectionById(params.slug);
    if (collection.data.collection) {
      if (collection.data.collection._id === '') {
        router.push('/');
        return;
      }
      setFormData(collection.data.collection);
    }
  };

  useEffect(() => {
    if (!formData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  return (
    <div>
      <CreateCuration editMode={formData} />
    </div>
  );
}
