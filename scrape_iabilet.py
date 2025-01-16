import requests
from bs4 import BeautifulSoup
import csv
import re

def scrape_iabilet_events_no_description():
    """
    1. se accesează pagina principală iabilet cu evenimente București.
    2. se găsesc link-urile fiecărui eveniment.
    3. pentru fiecare eveniment, se parsează:
        detalii: Titlu, Data, Ora, Locație, Adresă, URL Imagine
    """

    url_main = "https://www.iabilet.ro/bilete-in-bucuresti/bilete-concerte/"
    resp = requests.get(url_main)
    if resp.status_code != 200:
        print(f"Eroare la accesarea paginii principale: {resp.status_code}")
        return

    soup_main = BeautifulSoup(resp.content, "html.parser")
    # se gaseste div-ul cu toate evenimentele
    events = soup_main.find_all("div", class_="event-list-item")

    event_links = []
    for ev in events:
        a_tag = ev.find("a")
        if a_tag and a_tag.has_attr("href"):
            full_link = "https://www.iabilet.ro" + a_tag["href"]
            event_links.append(full_link)

    print(f"Găsit {len(event_links)} link-uri de evenimente iabilet.")

    with open("iabilet_events.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Titlu", "Data", "Ora", "Locație", "Adresă", "URL Imagine"])

        for link in event_links:
            event_resp = requests.get(link)
            if event_resp.status_code != 200:
                print(f"Eroare la accesarea evenimentului: {link}")
                continue

            soup_detail = BeautifulSoup(event_resp.content, "html.parser")

            try:
                # iau titlul
                h1_tag = soup_detail.find("h1")
                title = h1_tag.get_text(strip=True) if h1_tag else ""

                # iau locatia si adresa
                loc_div = soup_detail.find("div", class_="location")
                location_part, address_part = "", ""
                if loc_div:
                    span_list = loc_div.find_all("span")
                    if len(span_list) >= 2:
                        location_texts = [s.get_text(strip=True) for s in span_list[:-1]]
                        address_text = span_list[-1].get_text(strip=True)
                        location_part = ", ".join(location_texts)
                        address_part = address_text
                    else:
                        if span_list:
                            location_part = span_list[0].get_text(strip=True)
                        address_part = ""

                # iau data si ora
                date_div = soup_detail.find("div", class_="date")
                date_time_raw = date_div.get_text(" ", strip=True) if date_div else ""

                # impart data si ora
                data_part, ora_part = split_date_and_ora(date_time_raw)

                # iau url imagine
                poster_div = soup_detail.find("div", class_="poster-image-container")
                if poster_div:
                    img = poster_div.find("img")
                    image_url = img["src"] if img else ""
                else:
                    image_url = ""

                writer.writerow([
                    title.strip(),
                    data_part.strip(),
                    ora_part.strip(),
                    location_part.strip(),
                    address_part.strip(),
                    image_url.strip()
                ])
                print(f"Salvat eveniment: {title}")
            except Exception as e:
                print(f"Eroare la procesarea evenimentului {link}: {e}")

    print("Finalizez scraping iabilet -> iabilet_events.csv.")


def split_date_and_ora(date_time_raw):

    # impart textul din <div class="date"> în Data și Ora.
    

    # sterg spatiile duble
    date_time_raw = " ".join(date_time_raw.split())

    # caut orele (format HH:MM)
    times = re.findall(r"\d{1,2}:\d{2}", date_time_raw)
    data_part = date_time_raw
    ora_part = ""

   # daca am gasit 2 ore si "acces de la" in text
    if len(times) == 2 and "acces de la" in date_time_raw.lower():
        # convertim orele în minute
        parsed_times = []
        for t in times:
            hh, mm = t.split(":")
            total_minutes = int(hh) * 60 + int(mm)
            parsed_times.append((t, total_minutes))

        # sortam dupa minute
        parsed_times.sort(key=lambda x: x[1])  
        # prima ora e cea mai mica
        smaller_time = parsed_times[0][0]
        bigger_time = parsed_times[1][0]

        
        ora_part = f"{bigger_time} (acces de la {smaller_time})"

        # elimin orele din text
        data_minus = re.sub(r"\d{1,2}:\d{2}", "", date_time_raw)
        # elimin "acces de la"
        data_minus = re.sub(r"acces\s+de\s+la\s+", "", data_minus, flags=re.IGNORECASE)

        data_part = " ".join(data_minus.split())
        return data_part.strip(",:-"), ora_part.strip()

    # altfel cautam data si ora
    match_ora = re.search(r"(ora\s+(\d{1,2}:\d{2}))", date_time_raw, re.IGNORECASE)
    if match_ora:
        ora_part = match_ora.group(2).strip()
        data_part = date_time_raw[:match_ora.start()].strip(", :-")
        return data_part.strip(), ora_part.strip()

    # caut "acces de la xx:yy"
    match_acces = re.search(r"(acces\s+de\s+la\s+(\d{1,2}:\d{2}))", date_time_raw, re.IGNORECASE)
    if match_acces:
        ora_part = match_acces.group(2).strip()
        # scot "acces de la xx:yy" din data
        data_part = (date_time_raw[:match_acces.start()] + date_time_raw[match_acces.end():]).strip(", :-")
        return data_part.strip(), ora_part.strip()

    # caut "ora xx:yy"
    match_time = re.search(r"(\d{1,2}:\d{2})", date_time_raw)
    if match_time:
        ora_part = match_time.group(1)
        # scot "ora xx:yy" din data
        data_part = (date_time_raw[:match_time.start()] + date_time_raw[match_time.end():]).strip(", :-")
        return data_part.strip(), ora_part.strip()

    # daca nu am gasit nimic, returnez textul 
    return date_time_raw.strip(), ""

if __name__ == "__main__":
    scrape_iabilet_events_no_description()
