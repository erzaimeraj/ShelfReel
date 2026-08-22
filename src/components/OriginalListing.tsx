import type { Showcase } from '@/types';

interface Props {
  showcase: Showcase;
}

export default function OriginalListing({ showcase }: Props) {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center py-16 px-6">
      <div className="max-w-md w-full" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {showcase.image_url && (
          <div className="mb-4 border border-gray-300 p-1">
            <img
              src={showcase.image_url}
              alt={showcase.original_title}
              className="w-full h-auto block"
            />
          </div>
        )}
        <h1 className="text-xl font-bold mb-1 text-black">
          {showcase.original_title}
        </h1>
        {showcase.original_price && (
          <p className="text-lg mb-2 text-black">{showcase.original_price}</p>
        )}
        {showcase.original_description && (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {showcase.original_description}
          </p>
        )}
        <div className="mt-6">
          <button className="px-4 py-2 bg-gray-200 text-black text-sm border border-gray-400">
            Add to Cart
          </button>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">Product listing · Original</p>
        </div>
      </div>
    </div>
  );
}
