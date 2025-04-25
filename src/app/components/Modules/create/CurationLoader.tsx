/* eslint-disable @next/next/no-img-element */
export default function CurationLoader({
  status,
  edit,
}: {
  edit?: boolean;
  status: { error: boolean; loading: boolean };
}) {
  return (
    <div className="flex flex-col gap-y-6 w-[30rem] pt-[31px] px-[60px] pb-[75px]  justify-center mx-auto">
      {status.loading && (
        <img
          src="/icons/refresh.svg"
          alt="refresh"
          className="w-20 lg:w-28 h-20 lg:h-28 mx-auto"
        />
      )}

      {!status.error && !status.loading ? (
        <img
          src="/icons/success.svg"
          alt="success"
          className="w-20 lg:w-28 h-20 lg:h-28 mx-auto"
        />
      ) : null}
      {status.error ? (
        <p className="text-center text-[20px] lg:text-[30px] text-[#fff] font-medium">
          Error {edit ? 'Updating' : 'Creating'} Curation
        </p>
      ) : (
        <p className="text-center text-[20px] lg:text-[30px] text-[#fff] font-medium">
          {!status.loading
            ? `Your Curation is ${edit ? 'Updated' : 'Created'}`
            : 'Creating Your Curation Please Wait!'}
        </p>
      )}
    </div>
  );
}
