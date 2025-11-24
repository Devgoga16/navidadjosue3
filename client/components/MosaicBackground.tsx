import { useEffect, useState } from "react";

interface MosaicPhoto {
  id: number;
  url: string;
}

const photos: MosaicPhoto[] = [
  {
    id: 1,
    url: "https://cdn.builder.io/api/v1/image/assets%2F4ce9a6fccabd48c3bd5daca7abb16ec5%2F1539d1ae9a9a43d581b71f28b05450a3?format=webp&width=800",
  },
  {
    id: 2,
    url: "https://cdn.builder.io/api/v1/image/assets%2F4ce9a6fccabd48c3bd5daca7abb16ec5%2F005c186d8ee54dbabbe1ad5b9f270403?format=webp&width=800",
  },
  {
    id: 3,
    url: "https://cdn.builder.io/api/v1/image/assets%2F4ce9a6fccabd48c3bd5daca7abb16ec5%2F18b371666de0483bb2151c06d2e3f2dd?format=webp&width=800",
  },
  {
    id: 4,
    url: "https://cdn.builder.io/api/v1/image/assets%2F4ce9a6fccabd48c3bd5daca7abb16ec5%2Fa086566b11534a72889217b015541480?format=webp&width=800",
  },
  {
    id: 5,
    url: "https://cdn.builder.io/api/v1/image/assets%2F4ce9a6fccabd48c3bd5daca7abb16ec5%2Fbba341c4146d4165949a0f39026bd462?format=webp&width=800",
  },
  {
    id: 6,
    url: "https://cdn.builder.io/api/v1/image/assets%2F4ce9a6fccabd48c3bd5daca7abb16ec5%2F548ecd4f72f948d78dedc2ddfafc2aed?format=webp&width=800",
  },
  {
    id: 7,
    url: "https://cdn.builder.io/api/v1/image/assets%2F4ce9a6fccabd48c3bd5daca7abb16ec5%2F29f19ff6d06948c5bc22f41e39a0a35a?format=webp&width=800",
  },
  {
    id: 8,
    url: "https://cdn.builder.io/api/v1/image/assets%2F4ce9a6fccabd48c3bd5daca7abb16ec5%2F26170c025cc148efbad614e579f7c4c5?format=webp&width=800",
  },
];

export default function MosaicBackground() {
  const [visiblePhotos, setVisiblePhotos] = useState<Set<number>>(
    new Set([1, 2, 3, 4]),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setVisiblePhotos((prev) => {
        const arr = Array.from(prev);
        const newSet = new Set(arr);

        const hiddenPhotos = photos
          .filter((p) => !newSet.has(p.id))
          .map((p) => p.id);

        if (hiddenPhotos.length > 0) {
          const randomHidden =
            hiddenPhotos[Math.floor(Math.random() * hiddenPhotos.length)];
          const randomVisible = arr[Math.floor(Math.random() * arr.length)];

          newSet.delete(randomVisible);
          newSet.add(randomHidden);
        }

        return newSet;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Grid background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>

      {/* Mosaic container */}
      <div className="absolute inset-0 grid grid-cols-4 gap-3 p-4 opacity-60">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`relative overflow-hidden rounded-lg transform transition-all duration-400 ease-in-out ${
              visiblePhotos.has(photo.id)
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <img
              src={photo.url}
              alt={`Photo ${photo.id}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Overlay for content legibility - subtle */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/15"></div>
    </div>
  );
}
