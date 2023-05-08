import styles from './Footer.module.css'

function Footer(){
    return(
        <footer className={styles.footer}>
            <p>
                <span className="bold">Love Dog</span> &copy; 2023
            </p>
        </footer>
    )
}

export default Footer