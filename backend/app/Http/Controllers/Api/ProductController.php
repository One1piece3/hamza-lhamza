<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected function mediaRoot(): string
    {
        return public_path('media');
    }

    protected function storeUploadedImage($image): string
    {
        $directory = $this->mediaRoot() . DIRECTORY_SEPARATOR . 'products';

        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $extension = strtolower($image->getClientOriginalExtension() ?: $image->extension() ?: 'jpg');
        $filename = Str::random(40) . '.' . $extension;
        $image->move($directory, $filename);

        return 'products/' . $filename;
    }

    protected function deleteStoredImage(?string $path): void
    {
        if (!$path) {
            return;
        }

        $fullPath = $this->mediaRoot() . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);

        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    protected function normalizeImagesInput(Request $request): void
    {
        if (!$request->hasFile('images') && $request->hasFile('images[]')) {
            $request->files->set('images', $request->file('images[]'));
        }
    }

    protected function validationRules(bool $imagesRequired = true): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:3000',
            'price' => 'required|numeric|min:0.01',
            'category' => 'required|string|max:255',
            'stock' => 'required|integer|min:0',
            'size' => 'required|string|max:255',
            'color' => 'required|string|max:255',
            'is_featured' => 'nullable|boolean',
            'image_main_index' => 'nullable|integer|min:0|max:5',
            'images' => $imagesRequired ? 'required|array|min:1|max:6' : 'nullable|array|max:6',
            'images.*' => 'file|mimetypes:image/jpeg,image/png,image/webp|max:2048',
        ];
    }

    public function index()
    {
        return response()->json(Product::with('images')->latest()->get());
    }

    public function update(Request $request, $id)
    {
        $product = Product::with('images')->findOrFail($id);
        $this->normalizeImagesInput($request);

        $validated = $request->validate($this->validationRules(false));

        $product->update([
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'category' => trim($validated['category']),
            'stock' => $validated['stock'],
            'size' => trim($validated['size']),
            'color' => trim($validated['color']),
            'is_featured' => $validated['is_featured'] ?? false,
        ]);

        if ($request->hasFile('images')) {
            foreach ($product->images as $oldImage) {
                $this->deleteStoredImage($oldImage->image_path);
            }

            $product->images()->delete();
            $mainImageIndex = (int) ($validated['image_main_index'] ?? 0);

            foreach ($request->file('images') as $index => $image) {
                $path = $this->storeUploadedImage($image);

                $product->images()->create([
                    'image_path' => $path,
                    'is_main' => $index === $mainImageIndex,
                ]);
            }
        }

        return response()->json([
            'message' => 'Produit mis a jour avec succes',
            'product' => $product->load('images'),
        ]);
    }

    public function store(Request $request)
    {
        $this->normalizeImagesInput($request);
        $validated = $request->validate($this->validationRules(true));

        $product = Product::create([
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'category' => trim($validated['category']),
            'stock' => $validated['stock'],
            'size' => trim($validated['size']),
            'color' => trim($validated['color']),
            'is_featured' => $validated['is_featured'] ?? false,
        ]);

        $mainImageIndex = (int) ($validated['image_main_index'] ?? 0);

        foreach ($request->file('images', []) as $index => $image) {
            $path = $this->storeUploadedImage($image);

            $product->images()->create([
                'image_path' => $path,
                'is_main' => $index === $mainImageIndex,
            ]);
        }

        return response()->json([
            'message' => 'Produit ajoute avec succes',
            'product' => $product->load('images'),
        ], 201);
    }

    public function show($id)
    {
        return response()->json(Product::with('images')->findOrFail($id));
    }

    public function destroy($id)
    {
        $product = Product::with('images')->findOrFail($id);

        foreach ($product->images as $image) {
            $this->deleteStoredImage($image->image_path);
        }

        $product->images()->delete();
        $product->delete();

        return response()->json([
            'message' => 'Produit supprime avec succes',
        ]);
    }
}
