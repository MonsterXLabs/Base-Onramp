const CurationIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.58333 11.139V13.889M9.25 11.139V13.889M12.9167 11.139V13.889M1 17.5557H17.5M1 7.47233H17.5M1 4.72233L9.25 1.05566L17.5 4.72233M1.91667 7.47233H16.5833V17.5557H1.91667V7.47233Z"
        stroke={props?.stroke || '#FFFFFF20'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CurationIcon;
