
import TheFooter from "@/components/common/TheFooter";
import TheHeader from "@/components/common/TheHeader";
import { Fragment } from "react"

const ContestLayout = (props: any) => {
    return (
        <Fragment>
            <div className="mt-md-5 mt-3">
                <TheHeader />
            </div>
            <main className="container">
                {props.children}
            </main>
        </Fragment>
    )
}
export default ContestLayout;