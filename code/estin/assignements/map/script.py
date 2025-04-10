
"""
this script was used to get the map data off osm api bs they either limit ur download or make 
you download the 145G file , wich is an over-kill for a small project like this
"""



import requests
import json


def fetch_data_from_overpass(lat_min, lat_max, lon_min, lon_max):
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      node({lat_min},{lon_min},{lat_max},{lon_max});
      way({lat_min},{lon_min},{lat_max},{lon_max});
      relation({lat_min},{lon_min},{lat_max},{lon_max});
    );
    out body;
    """
    response = requests.get(overpass_url, params={'data': overpass_query})
    
    if response.status_code == 200:
        try:
            return response.json()
        except json.JSONDecodeError:
            print("Failed to decode JSON response.")
            print("Response content:", response.text)
            return None
    else:
        print(f"Request failed with status code {response.status_code}.")
        print("Response content:", response.text)
        return None


def divide_bounding_box(lat_min, lat_max, lon_min, lon_max, rows, cols):
    if lat_min > lat_max:
        lat_min, lat_max = lat_max, lat_min
    if lon_min > lon_max:
        lon_min, lon_max = lon_max, lon_min
    
    lat_step = (lat_max - lat_min) / rows
    lon_step = (lon_max - lon_min) / cols
    
    sub_regions = []
    for i in range(rows):
        for j in range(cols):
            sub_lat_min = lat_min + i * lat_step
            sub_lat_max = lat_min + (i + 1) * lat_step
            sub_lon_min = lon_min + j * lon_step
            sub_lon_max = lon_min + (j + 1) * lon_step
            sub_regions.append((sub_lat_min, sub_lat_max, sub_lon_min, sub_lon_max))
    
    return sub_regions


def merge_nodes_data(nodes_list):
    merged_nodes = {}
    for nodes in nodes_list:
        if nodes:
            for node_id, node_info in nodes.items():
                if node_id not in merged_nodes:
                    # First time seeing the node, add it directly
                    merged_nodes[node_id] = node_info
                else:
                    # Merge connections if necessary (use set to avoid duplicates)
                    merged_nodes[node_id]['connections'] = list(set(merged_nodes[node_id]['connections'] + node_info['connections']))
    
    return merged_nodes


LATITUDE_BOUNDS = [37.0464, 36.6910]
LONGITUDE_BOUNDS = [7.4384, 8.2528]


sub_regions = divide_bounding_box(LATITUDE_BOUNDS[0], LATITUDE_BOUNDS[1], LONGITUDE_BOUNDS[0], LONGITUDE_BOUNDS[1], rows=4, cols=4)


all_nodes = []

for region in sub_regions:
    lat_min, lat_max, lon_min, lon_max = region
    print(f"Fetching data for region: {lat_min}, {lat_max}, {lon_min}, {lon_max}")
    data = fetch_data_from_overpass(lat_min, lat_max, lon_min, lon_max)
    
    if data:
        # Extract nodes from the fetched data
        nodes = {}
        for element in data['elements']:
            if element['type'] == 'node':
                node_id = str(element['id'])
                nodes[node_id] = {
                    "id": node_id,
                    "position": {
                        "lat": element['lat'],
                        "lng": element['lon']
                    },
                    "connections": []
                }
            elif element['type'] == 'way':
                node_ids = [str(node_id) for node_id in element['nodes']]
                for i, node_id in enumerate(node_ids):
                    if node_id not in nodes:
                        continue
                    if i > 0:
                        nodes[node_ids[i]]['connections'].append(node_ids[i-1])
                    if i < len(node_ids) - 1:
                        nodes[node_ids[i]]['connections'].append(node_ids[i+1])
        
        all_nodes.append(nodes)


merged_nodes = merge_nodes_data(all_nodes)


output_file = 'annaba_map_merged.json'
with open(output_file, 'w') as f:
    json.dump(merged_nodes, f, indent=2)

print(f"Data has been saved to {output_file}")
