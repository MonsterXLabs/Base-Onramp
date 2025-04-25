const HelpIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="22"
      height="23"
      viewBox="0 0 22 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.54202 8.71777C8.04538 7.64968 9.40356 6.88444 11 6.88444C13.0251 6.88444 14.6667 8.11566 14.6667 9.63444C14.6667 10.9173 13.4956 11.9949 11.9114 12.2988C11.4142 12.3942 11 12.7948 11 13.3011M11 16.0511H11.0092M19.25 11.4678C19.25 16.0241 15.5563 19.7178 11 19.7178C6.44365 19.7178 2.75 16.0241 2.75 11.4678C2.75 6.91142 6.44365 3.21777 11 3.21777C15.5563 3.21777 19.25 6.91142 19.25 11.4678Z"
        stroke={props?.stroke || '#FFFFFF20'}
        strokeWidth="1.0625"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HelpIcon;
