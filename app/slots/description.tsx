import { ethers } from "ethers";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Arrow } from "svg/arrow";

type DescriptionProps = {
  fee: string;
};

export const Description = ({ fee }: DescriptionProps) => {
  return (
    <div>
      <Introduction fee={fee} />
      <HowToUse />
      <ImageType />
      <HowItWorks />
      <Footer />
    </div>
  );
};

type IntroductionProps = {
  fee: string;
};
const Introduction = ({ fee }: IntroductionProps) => {
  const numImages = 10;
  const imageNames = Array.from(Array(numImages).keys()).map(
    (index) => `${index}.jpg`
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const showNextImage = useCallback(() => {
    const nextIndex = (currentImageIndex + 1) % imageNames.length;
    setCurrentImageIndex(nextIndex);
  }, [currentImageIndex, imageNames.length]);

  useEffect(() => {
    const interval = setInterval(showNextImage, 2000);

    return () => clearInterval(interval);
  }, [showNextImage]);

  return (
    <div className="mt-16 md:mt-32">
      <div className="flex flex-col lg:flex-row mx-auto w-fit gap-16">
        <div className="max-w-xl text-left">
          <h2 className="text-4xl mb-8">
            Create your own unique NFT with photorealistic art
          </h2>
          <p className="mb-4">
            Mint a token for just {ethers.utils.formatEther(fee)} eth and get
            access to create unlimited avatars. The mint fee covers the cost of
            initial training of the AI model, but all image generations after
            that are free!
          </p>
          <p>
            You can either create completely custom prompts, or you can use one
            of our random prompts to get some inspiration. The generated NFT
            will then be available on-chain and by all platforms that accept or
            display NFTs. View the collection on{" "}
            <a
              className="underline"
              href="https://opensea.io/collection/soulbound-ai"
            >
              opensea
            </a>
            .
          </p>
        </div>
        <div className="w-fit flex flex-col md:flex-row gap-8 items-center mx-auto">
          <div>
            <Image
              src="/sample/photo-stack.webp"
              alt="Photo stack"
              width={200}
              height={200}
            />
          </div>
          <div>
            <div className="stroke-pink-500 rotate-180 md:rotate-90">
              <Arrow />
            </div>
          </div>
          <div className="h-[200px]">
            {imageNames.map((imageName, index) => {
              return (
                <div className="relative w-[200px]" key={imageName}>
                  <button
                    onClick={() => showNextImage()}
                    className={`${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    } transition-opacity duration-300 absolute w-[200px] h-[200px]`}
                  >
                    <Image
                      src={`/sample/${imageName}`}
                      alt={`Photo example ${index}`}
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const HowToUse = () => {
  return (
    <div className="mt-32 text-center w-fit mx-auto">
      <div className="flex flex-col-reverse lg:flex-row gap-16">
        <Image
          className="mx-auto"
          src={`/upload-example.png`}
          alt={`Upload image example`}
          width={500}
          height={500}
        />
        <div className="max-w-xl text-left">
          <h2 className="text-4xl mb-8">How do I use it?</h2>
          <p className="mb-4">
            Simply connect your wallet and mint an NFT. Afterwards, we will ask
            you to upload at least 10 images that will be used to train an AI
            model. All of your images are only used for trainning and will be
            deleted from our servers within 24 hours.
          </p>
          <p>
            When the model is trained, you are free to generate as many images
            as you like for free and select your favourite one. This image will
            then be tied to your wallet and stored forever.
          </p>
        </div>
      </div>
    </div>
  );
};

const ImageType = () => {
  return (
    <div className="mt-32 text-left w-fit mx-auto">
      <div className="md:flex-row max-w-xl">
        <h2 className="text-4xl mb-8">What kind of images should I upload?</h2>
        <p className="mb-4">
          We currently support JPG and PNG images. Generally, the more images
          you upload, the better the output quality will be. You should upload
          images with:
        </p>
        <ul className="list-disc ml-8">
          <li>Different angles, backgrounds, lighting conditions and poses</li>
          <li>
            Shoulders should be visible, no sunglasses, different emotions, and
            backgrounds will help
          </li>
          <li>Please use a single object per uploaded image</li>
          <li>Later, uploaded images will be automatically removed</li>
        </ul>
      </div>
    </div>
  );
};

// TODO: Add image for how dreambooth works
const HowItWorks = () => {
  return (
    <div className="mt-32 text-left w-fit mx-auto">
      <div className="max-w-xl">
        <h2 className="text-4xl mb-8">How it works</h2>
        <p className="mb-4">
          We use a{" "}
          <a className="underline" href="https://arxiv.org/abs/2208.12242">
            DreamBooth
          </a>{" "}
          AI model that gets trained on the images that you uploaded. This model
          will figure out what your general features look like and then generate
          output images that look similar in various different styles.
        </p>
        <p>
          The NFT that gets minted follows standard interfaces so you can use
          your token wherever you can use an NFT on the web.
        </p>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="mt-32 text-center">
      A project by{" "}
      <a className="underline" href="https://twitter.com/0xbanky">
        0xbanky.eth
      </a>
    </div>
  );
};
