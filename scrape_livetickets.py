import re
import time
import csv
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By

def parse_address_without_phone(html_snippet):
    """
    se primeste un fragment HTML care conține adresa unui eveniment
    și returnez adresa fara  "TEL:..." și "Beraria H"
    """

    soup = BeautifulSoup(html_snippet, "html.parser")
    text = soup.get_text(" ", strip=True)
    #eliminare "Beraria H"
    text = re.sub(r"(?i)\bberaria\s*h\b", "", text)

    # stergem "TEL:..." si orice urmeaza dupa
    text = re.sub(r"(?i)\s*tel:\s*[\+0-9.\- ]+.*", "", text)

    text = " ".join(text.split()).strip(", ")

    return text

def scrape_livetickets_events_no_description():
    """
    1. se acceseaza pagina principală LiveTickets cu evenimente București.
    2. se găsesc link-urile fiecărui eveniment.
    3. pentru fiecare eveniment, se parsează:
        detalii: Titlu, Data, Ora, Locație, Adresă, URL Imagine
        si elimin TEL:... si "Beraria H" din Adresă

    """

    driver = webdriver.Chrome()  

    url_main = "https://www.livetickets.ro/cautare/bucuresti"
    driver.get(url_main)
    time.sleep(5) 

    soup_main = BeautifulSoup(driver.page_source, "html.parser")

    event_cards = soup_main.select("div.col-md-4.col-sm-6.row-item-3 a.hotel_container")
    event_links = ["https://www.livetickets.ro" + e.get("href") for e in event_cards]

    print(f"Am găsit {len(event_links)} link-uri de evenimente LiveTickets.")

    with open("livetickets_events.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Titlu", "Data", "Ora", "Locație", "Adresă", "URL Imagine"])

        for link in event_links:
            driver.get(link)
            time.sleep(3)  

            soup_detail = BeautifulSoup(driver.page_source, "html.parser")

            # extragere titlu
            h1_tag = soup_detail.find("h1")
            title = h1_tag.get_text(strip=True) if h1_tag else "N/A"

            # stergere "București - " din titlu
            title = title.replace("// București - ", "")
            title = title.replace("| București - ", "")
            title = title.replace("București - ", "")

            # extragere data si ora
            date_div = soup_detail.find("div", style="margin-bottom: 5px;")
            date_time_raw = date_div.get_text(strip=True) if date_div else ""
            data_part, ora_part = "", ""
            if "-" in date_time_raw:
                first_part = date_time_raw.split("-", 1)[0].strip()
                if "," in first_part and ":" in first_part:
                    splitted = first_part.rsplit(",", 1)
                    data_part = splitted[0].strip(", ")
                    ora_part = splitted[1].strip()
                else:
                    data_part = first_part
            else:
                data_part = date_time_raw

            # extragere locatie
            placeholder_icon = soup_detail.find("i", class_="flaticon-placeholder")
            location_part = placeholder_icon.next_sibling.strip() if placeholder_icon else ""

            # extragere adresa
            # se cauta  div care conține style="text-align: center", ce include probabil  "TEL:" și "Beraria H"
            address_part = ""
            address_div = soup_detail.select_one("div[style*='text-align: center']")
            if address_div:
                address_html = address_div.prettify()
                address_part = parse_address_without_phone(address_html)

            # extragere URL imagine
            image_url = "N/A"
            section_cover = soup_detail.find("section", id="sectCover")
            if section_cover:
                div_bg = section_cover.find("div", style=lambda s: s and "background-image" in s)
                if div_bg:
                    style_attr = div_bg.get("style", "")
                    try:
                        image_url = style_attr.split("url(")[1].split(")")[0].replace('"', '').replace("&quot;", "")
                    except:
                        pass
            writer.writerow([
                title.strip(", "),
                data_part.strip(", "),
                ora_part.strip(", "),
                location_part.strip(", "),
                address_part.strip(", "),
                image_url.strip()
            ])

            print(f"[LiveTickets] Salvat: {title}")

    driver.quit()
    print("Scraping LiveTickets finalizat -> 'livetickets_events.csv' (fără descriere, + Adresă fără TEL).")

if __name__ == "__main__":
    scrape_livetickets_events_no_description()
