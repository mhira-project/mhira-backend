
export class Validator {

    static isPhone(value: string) {

        // If value is `undefined` or `empty`, return `false`
        if(!value?.length) {
            return false;
        }

        /**
         * Format example +15555555555.
         */
        const conditions = [];
        conditions.push(value.indexOf('+') === 0);
        conditions.push(value.length >= 9);
        conditions.push(value.length <= 16);
        conditions.push(!(/[^\d+]/i.test(value)));

        // Find boolean product of all conditions
        return conditions.reduce(function (prev, curr) {
            return prev && curr;
        });
    }

    static isEmail(email: string) {
        let regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");

        const isValid = regex.test(email)

        if (!isValid) {
            throw new Error("You have entered an invalid email address!")
        } 
        return isValid
    }

}
