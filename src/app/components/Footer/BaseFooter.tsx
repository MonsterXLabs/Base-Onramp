'use client';

import Logo from '@/components/Icon/Logo';
import { Label } from '@/components/ui/label';
import { magazineLink } from '@/utils/constants';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function BaseFooter() {
  const [imageHovered, setImageHovered] = useState({
    instagram: '/icons/insta_white.svg',
    X: '/icons/X_white.svg',
    monsterx: '/icons/monsterx_white.svg',
    telegram: '/icons/telegram.svg',
  });

  return (
    <div className="flex flex-col sm:gap-y-4 gap-y-3 md:gap-y-6 text-white justify-around my-10 mt-8 sm:mt-10 md:mt-16">
      <div className="container">
        <div className="flex flex-wrap justify-between !px-5 sm:px-0 gap-5 md:gap-10">
          <Link href="/dashboard/appreciate">Appreciate</Link>
          <Link href="/dashboard/curation">Curation</Link>
          <Link href={magazineLink}>Magazine</Link>
          <Link target="_blank" href="https://monsterx.gitbook.io/whitepaper">
            Who We Are
          </Link>
          <div className="flex-col sm:flex hidden gap-y-2 justify-center mx-auto lg:m-0">
            <p className="text-center">Community</p>
            <div className="flex gap-x-3 mt-3">
              <Link
                target="_blank"
                className="w-[40px] h-[40px]"
                href="https://www.instagram.com/vaultx_rwa"
              >
                <Image
                  quality={100}
                  alt="instagram"
                  src={imageHovered.instagram}
                  height={40}
                  width={40}
                  onMouseEnter={() =>
                    setImageHovered({
                      ...imageHovered,
                      instagram: '/icons/insta_yellow.svg',
                    })
                  }
                  onMouseLeave={() =>
                    setImageHovered({
                      ...imageHovered,
                      instagram: '/icons/insta_white.svg',
                    })
                  }
                />
              </Link>

              <Link
                target="_blank"
                className="w-[40px] h-[40px]"
                href="https://x.com/vaultx_RWA"
              >
                <Image
                  quality={100}
                  alt="twitter"
                  src={imageHovered.X}
                  height={40}
                  width={40}
                  onMouseEnter={() =>
                    setImageHovered({
                      ...imageHovered,
                      X: '/icons/X_yellow.svg',
                    })
                  }
                  onMouseLeave={() =>
                    setImageHovered({
                      ...imageHovered,
                      X: '/icons/X_white.svg',
                    })
                  }
                />
              </Link>

              <Link
                target="_blank"
                className="w-[40px] h-[40px]"
                href="https://t.me/VaultX_RWA"
              >
                <Image
                  quality={100}
                  alt="twitter"
                  src={imageHovered.telegram}
                  height={40}
                  width={40}
                  onMouseEnter={() =>
                    setImageHovered({
                      ...imageHovered,
                      telegram: '/icons/telegram-yellow.svg',
                    })
                  }
                  onMouseLeave={() =>
                    setImageHovered({
                      ...imageHovered,
                      telegram: '/icons/telegram.svg',
                    })
                  }
                />
              </Link>

              <Link
                target="_blank"
                className="w-[40px] h-[40px]"
                href="https://monsterx.gitbook.io/whitepaper"
              >
                <Image
                  quality={100}
                  alt="monsterx"
                  src={imageHovered.monsterx}
                  height={40}
                  width={40}
                  onMouseEnter={() =>
                    setImageHovered({
                      ...imageHovered,
                      monsterx: '/icons/monsterx_yellow.svg',
                    })
                  }
                  onMouseLeave={() =>
                    setImageHovered({
                      ...imageHovered,
                      monsterx: '/icons/monsterx_white.svg',
                    })
                  }
                />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex-col flex sm:hidden gap-y-2 justify-center mx-auto lg:m-0 w-full mt-5">
          <p className="text-center">Join Us Today!</p>
          <div className="flex gap-x-3 mt-3 justify-center">
            <Link
              target="_blank"
              className="w-[40px] h-[40px]"
              href="https://www.instagram.com/vaultx_rwa"
            >
              <Image
                quality={100}
                alt="instagram"
                src={imageHovered.instagram}
                height={40}
                width={40}
                onMouseEnter={() =>
                  setImageHovered({
                    ...imageHovered,
                    instagram: '/icons/insta_yellow.svg',
                  })
                }
                onMouseLeave={() =>
                  setImageHovered({
                    ...imageHovered,
                    instagram: '/icons/insta_white.svg',
                  })
                }
              />
            </Link>

            <Link
              target="_blank"
              className="w-[40px] h-[40px]"
              href="https://x.com/vaultx_RWA"
            >
              <Image
                quality={100}
                alt="instagram"
                src={imageHovered.X}
                height={40}
                width={40}
                onMouseEnter={() =>
                  setImageHovered({ ...imageHovered, X: '/icons/X_yellow.svg' })
                }
                onMouseLeave={() =>
                  setImageHovered({ ...imageHovered, X: '/icons/X_white.svg' })
                }
              />
            </Link>

            <Link
                target="_blank"
                className="w-[40px] h-[40px]"
                href="https://t.me/VaultX_RWA"
              >
                <Image
                  quality={100}
                  alt="twitter"
                  src={imageHovered.telegram}
                  height={40}
                  width={40}
                  onMouseEnter={() =>
                    setImageHovered({
                      ...imageHovered,
                      telegram: '/icons/telegram-yellow.svg',
                    })
                  }
                  onMouseLeave={() =>
                    setImageHovered({
                      ...imageHovered,
                      telegram: '/icons/telegram.svg',
                    })
                  }
                />
            </Link>
            <Link
              target="_blank"
              className="w-[40px] h-[40px]"
              href="https://monsterx.gitbook.io/whitepaper"
            >
              <Image
                quality={100}
                alt="instagram"
                src={imageHovered.monsterx}
                height={40}
                width={40}
                onMouseEnter={() =>
                  setImageHovered({
                    ...imageHovered,
                    monsterx: '/icons/monsterx_yellow.svg',
                  })
                }
                onMouseLeave={() =>
                  setImageHovered({
                    ...imageHovered,
                    monsterx: '/icons/monsterx_white.svg',
                  })
                }
              />
            </Link>
          </div>
        </div>
      </div>
      <hr className="border-white/[13%] mt-[50px]" />
      <div className="!px-5 sm:px-0 container">
        <Link href="/" className="flex md:hidden justify-center">
          <Logo />
        </Link>
        <div className="flex flex-col gap-y-6 pt-4 pb-0 justify-center items-center relative text-[#878787] w-full">
          <Link href="/" className="md:flex hidden">
            <Logo />
          </Link>
          <div className="flex text-xs sm:text-sm gap-x-4 justify-center flex-wrap gap-y-2 manrope-font font-medium items-center w-full">
            <Label className="block text-center">
              © {new Date().getFullYear()} VaultX. All right reserved.
            </Label>
            <Label className="block text-center">Privacy Policy</Label>
            <Label className="block text-center">Terms of Service</Label>
            {/* <div className="lg:absolute lg:right-20 lg:bottom-0">
              <a className="text-sm font-medium" href="mailto:info@monsterx.io">
                info@monsterx.io
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
