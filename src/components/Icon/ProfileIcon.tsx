import * as React from 'react';
import { SVGProps } from 'react';

export const DefaultProfile = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <g clipPath="url(#a)">
      <path
        fill="url(#b)"
        d="M25 50c13.807 0 25-11.193 25-25S38.807 0 25 0 0 11.193 0 25s11.193 25 25 25Z"
      />
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={25}
        x2={27.17}
        y1={0}
        y2={68.207}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#E2FE26" />
        <stop offset={1} stopColor="#879817" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h50v50H0z" />
      </clipPath>
    </defs>
  </svg>
);

export const DropdownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.75 4.125 6 7.875l-3.75-3.75"
    />
  </svg>
);
