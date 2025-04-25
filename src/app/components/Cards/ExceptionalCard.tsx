/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export default function ExceptionalCard({
  logo,
  name,
  id,
}: {
  logo: string;
  name: string;
  id: string;
}) {
  return (
    <div className="bg-dark pt-3 pb-5 px-3 col-span-12 xss:col-span-6">
      <div className="w-full h-full">
        <Link href={`/dashboard/curation/${id}`}>
          <img
            src={logo}
            className="exceptinal_curation__image w-full aspect-square object-cover"
            alt="curation"
          />
        </Link>
      </div>
      <p className="lg:text-3xl md:text-2xl text-xl font-semibold text-white text-center sm:mt-4 mt-3 md:mt-5">
        {name}
      </p>
    </div>
  );
}
