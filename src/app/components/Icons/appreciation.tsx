const AppreciationIcon = (props: React.SVGProps<SVGSVGElement>) => {
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
        d="M3.66699 14.7227L7.87063 10.519C8.58659 9.80306 9.74739 9.80306 10.4634 10.519L14.667 14.7227M12.8337 12.8893L14.2873 11.4357C15.0033 10.7197 16.1641 10.7197 16.88 11.4357L18.3337 12.8893M12.8337 7.38932H12.8428M5.50033 18.3893H16.5003C17.5128 18.3893 18.3337 17.5685 18.3337 16.556V5.55599C18.3337 4.54347 17.5128 3.72266 16.5003 3.72266H5.50033C4.4878 3.72266 3.66699 4.54347 3.66699 5.55599V16.556C3.66699 17.5685 4.4878 18.3893 5.50033 18.3893Z"
        stroke={props?.stroke || '#FFFFFF20'}
        stroke-width="1.0625"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default AppreciationIcon;
