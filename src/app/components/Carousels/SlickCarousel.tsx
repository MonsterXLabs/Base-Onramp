'use client';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useRef, useState } from 'react';

export default function SlickCarousel(props: any) {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const [loadedImageIndices, setLoadedImageIndices] = useState<boolean[]>([]);

  const images = props.images;
  const placeholder = props.placeholder;
  const slider = useRef(null);

  useEffect(() => {
    setLoadedImageIndices(new Array(images.length).fill(false));
  }, [images]);

  const handleImageLoad = (index: number) => {
    setLoadedImageIndices((prev) => {
      const newLoadedState = [...prev];
      newLoadedState[index] = true;
      return newLoadedState;
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <Slider ref={slider} {...settings}>
        {images.map((image: string, index: number) => (
          <div key={index}>
            <img
              src={loadedImageIndices[index] ? image : placeholder}
              alt="NFT"
              style={{
                margin: 'auto',
                height: '100vh',
                transition: 'opacity 0.5s ease-in-out',
              }}
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageLoad(index)}
            />
          </div>
        ))}
      </Slider>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '5px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '100%',
          cursor: 'pointer',
        }}
        onClick={() => (slider?.current as any)?.slickPrev()}
      >
        <img src="/images/image-left.png" alt="arrow" />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '5px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '100%',
          cursor: 'pointer',
        }}
        onClick={() => (slider?.current as any)?.slickNext()}
      >
        <img
          src="/images/image-left.png"
          alt="arrow"
          style={{ transform: 'rotate(-180deg)' }}
        />
      </div>
    </div>
  );
}
