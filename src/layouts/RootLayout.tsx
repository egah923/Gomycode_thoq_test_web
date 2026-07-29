
import TheFooter from "@/components/common/TheFooter";
import TheHeader from "@/components/common/TheHeader";
import { Fragment } from "react"

const RootLayout = (props: any) => {
    return (
        <Fragment>
            <div className="mt-md-5 mt-3">
                <TheHeader />
            </div>
            <main>
                {props.children}
            </main>
            {!props?.noFooter && <TheFooter />}
        </Fragment>
    )
}
export default RootLayout;