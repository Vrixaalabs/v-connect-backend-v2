export interface SendVerificationEmailRequest {
    product_name: string;
    verify_link: string;
}

export const emailServices = {
    sendVerificationEmail: async (
        to: string, 
        data: SendVerificationEmailRequest
    ) => {
        const res = await fetch(`https://app.loops.so/api/v1/transactional`, {
            method: 'POST',
            body: JSON.stringify({
                transactionalId: 'cmfho6p7940c0xo0igkktmats',
                email: to,
                dataVariables: data
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer e1790a82eee2471fbec7ff29788851db`
            }
        })
    }
}