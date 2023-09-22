import { fileURLToPath } from "url";

const TOLERANCE = 0.01;
class Cosine {
    static factorial(n) {
        let output = 1;
        for(let i=2; i<=n; i++) {
            output = output*i;
        }
        return output;
    }

    static polynomialTerm(rad, n) {
        return Math.pow(rad, n)/Cosine.factorial(n);
    }

    static cosineValue(radian) {
        let rad = radian%(2*Math.PI);
        // Simplistic calculation
        // using only the first few polynomial terms of the power series expansion
        // WARNING: This is a POOR implementation, meant for demonstration purpose only..
        return (1 - Cosine.polynomialTerm(rad, 2) + Cosine.polynomialTerm(rad, 4)
                - Cosine.polynomialTerm(rad, 6) + Cosine.polynomialTerm(rad, 8)
                - Cosine.polynomialTerm(rad, 10) + Cosine.polynomialTerm(rad, 12)
                - Cosine.polynomialTerm(rad, 14) + Cosine.polynomialTerm(rad, 16)
                - Cosine.polynomialTerm(rad, 18)
                );
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    for (let i=0; i<7; i=i+0.1) {
        if (Math.abs(Cosine.cosineValue(i) - Math.cos(i))> TOLERANCE) {
            console.log("Tolerance exceeded. Cosine value for :", i, Cosine.cosineValue(i), Math.cos(i));
        }
        // console.log("Cosine value : ", i, Cosine.cosineValue(i), Math.cos(i));
    }
}

export default Cosine;
