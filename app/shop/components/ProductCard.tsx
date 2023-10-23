import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { PostgrestError } from "@supabase/supabase-js";

type Product = {
    id: number;
    name: string;
    price: number;
    image_url: string;
};

export default async function ProductCard() {
    // gets first 3 products from the database table products
    const {
        data: products,
        error,
    }: { data: any; error: PostgrestError | null } = await supabase
        .from("products")
        .select("*")
        .limit(3);
    if (error) {
        throw new Error(error.message);
    }

    return (
        <>
            {products.map((product:Product) => (
                <div
                    key={product.id}
                    className="bg-clrprimary px-4 py-8 gap-8 items-center flex flex-col"
                >
                    <div className="flex flex-col items-center">
                        <Image
                            className="object-contain max-h-80"
                            src={product.image_url}
                            alt="graphic Catch the fox t-shirt"
                            width={400}
                            height={450}
                        />
                        <p className="pt-2 italic text-xl md:text-2xl">
                            {product.name}
                        </p>
                        <p className="font-semibold italic">
                            {product.price}kr
                        </p>
                    </div>
                    <button className="py-4 px-8 mt-auto bg-clrdark w-fit font-extrabold">
                        MORE
                    </button>
                </div>
            ))}
        </>
    );
}
