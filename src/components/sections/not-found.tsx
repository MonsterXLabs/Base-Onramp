import { Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';

const NotFoundComponent = () => {
  return (
    <div className="w-full h-screen flex flex-col gap-y-2 px-2 relative">
      <Image
        quality={100}
        src="/images/not-found-bg.png"
        fill
        alt="not-found-bg"
        className="absolute z-[1] aspect-video object-cover"
        // width={1920}
        // height={1080}
      />
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-[100px] font-extrabold manrope-font">
          Coming soon
        </h1>
        <p className="azeret-mono-font text-white/[53%]">
          in the meantime, sign up for our monthly newsletter to stay up to date
        </p>
      </div>
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center justify-center gap-x-5">
          <a className="w-8 h-8 rounded-full border border-white flex justify-center items-center">
            <Instagram className="w-5 h-5 fill-white stroke-black" />
          </a>
          <a className="w-8 h-8 rounded-full border border-white flex justify-center items-center">
            <svg
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_3474_12420)">
                <path
                  d="M10.9183 18.3327C15.5207 18.3327 19.2516 14.6017 19.2516 9.99935C19.2516 5.39697 15.5207 1.66602 10.9183 1.66602C6.31592 1.66602 2.58496 5.39697 2.58496 9.99935C2.58496 14.6017 6.31592 18.3327 10.9183 18.3327Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.58496 10H19.2516"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.9183 18.3327C12.7593 18.3327 14.2516 14.6017 14.2516 9.99935C14.2516 5.39697 12.7593 1.66602 10.9183 1.66602C9.07734 1.66602 7.58496 5.39697 7.58496 9.99935C7.58496 14.6017 9.07734 18.3327 10.9183 18.3327Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.02539 4.22461C6.53343 5.73265 8.61676 6.6654 10.9179 6.6654C13.2191 6.6654 15.3025 5.73265 16.8105 4.22461"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.7031 15.4408C15.195 13.9327 13.1117 13 10.8105 13C8.50934 13 6.42601 13.9327 4.91797 15.4408"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_3474_12420">
                  <rect
                    width="20"
                    height="20"
                    fill="white"
                    transform="translate(0.917969)"
                  />
                </clipPath>
              </defs>
            </svg>
          </a>
          <a className="w-8 h-8 rounded-full border border-white flex justify-center items-center">
            <Twitter className="w-5 h-5 fill-white" />
          </a>
          <a className="w-8 h-8 rounded-full border border-white flex justify-center items-center">
            <svg
              width="18"
              height="15"
              viewBox="0 0 18 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.9482 0.534747L0.954434 6.31661C-0.0688303 6.72761 -0.0629104 7.29844 0.766694 7.55298L4.6162 8.75384L13.5228 3.13434C13.944 2.87811 14.3287 3.01595 14.0125 3.29671L6.79634 9.80924H6.79465L6.79634 9.81008L6.5308 13.778C6.91981 13.778 7.09148 13.5995 7.30966 13.389L9.17945 11.5708L13.0687 14.4435C13.7858 14.8385 14.3008 14.6355 14.4793 13.7797L17.0324 1.74744C17.2937 0.699653 16.6324 0.225231 15.9482 0.534747V0.534747Z"
                fill="white"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundComponent;
