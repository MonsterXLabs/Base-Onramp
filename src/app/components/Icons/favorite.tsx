const FavoriteIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.63385 9.09957C0.650262 6.02874 1.79976 2.51882 5.02368 1.48024C6.71951 0.932985 8.59135 1.25565 10.0012 2.31624C11.3349 1.28499 13.2755 0.936652 14.9695 1.48024C18.1934 2.51882 19.3503 6.02874 18.3676 9.09957C16.8368 13.9671 10.0012 17.7162 10.0012 17.7162C10.0012 17.7162 3.21601 14.0239 1.63385 9.09957Z"
        stroke={props?.stroke || '#FFFFFF20'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.668 4.60938C14.6488 4.92654 15.3418 5.80196 15.4252 6.82954"
        stroke={props?.stroke || '#FFFFFF20'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FavoriteIcon;
